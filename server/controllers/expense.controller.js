const { prisma } = require('../config/db');
const { convertAmount } = require('../utils/currency.utils');
const multer = require('multer');
const sharp = require('sharp');
const Tesseract = require('tesseract.js');
const fs = require('fs');

exports.submitExpense = async (req, res) => {
  const { amount, originalCurrency, category, description, date, approvalRuleId } = req.body;
  const company = await prisma.company.findUnique({ where: { id: req.user.companyId } });
  
  const { convertedAmount, rate } = await convertAmount(parseFloat(amount), originalCurrency, company.currency);
  
  let receiptPath = req.file ? req.file.path : null;

  let finalApprovalRuleId = approvalRuleId;
  if (!finalApprovalRuleId) {
    const defaultRule = await prisma.approvalRule.findFirst({ where: { companyId: req.user.companyId, isDefault: true }});
    if (defaultRule) finalApprovalRuleId = defaultRule.id;
  }

  const expense = await prisma.expense.create({
    data: {
      employeeId: req.user.id,
      companyId: req.user.companyId,
      amount: parseFloat(amount),
      originalCurrency,
      convertedAmount,
      companyCurrency: company.currency,
      exchangeRate: rate,
      category,
      description,
      date: new Date(date),
      receiptPath,
      approvalRuleId: finalApprovalRuleId
    }
  });

  const app = req.app;
  const io = app.get('io');
  if (io) io.to(`company:${req.user.companyId}`).emit('expense:submitted', expense);

  res.status(201).json({ success: true, data: expense });
};

exports.getMyExpenses = async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  const where = { employeeId: req.user.id };
  if (status) where.status = status;

  const expenses = await prisma.expense.findMany({
    where, skip: parseInt(skip), take: parseInt(limit),
    include: { logs: { include: { approver: { select: { name: true } } } }, approvalRule: { select: { name: true } } },
    orderBy: { createdAt: 'desc' }
  });
  const total = await prisma.expense.count({ where });

  res.json({ success: true, data: expenses, total, page: parseInt(page), pages: Math.ceil(total / limit) });
};

exports.getAllExpenses = async (req, res) => {
  const { status, employeeId, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  const where = { companyId: req.user.companyId };
  if (status) where.status = status;
  if (employeeId) where.employeeId = employeeId;

  const expenses = await prisma.expense.findMany({
    where, skip: parseInt(skip), take: parseInt(limit),
    include: { employee: { select: { name: true } }, logs: true },
    orderBy: { createdAt: 'desc' }
  });
  const total = await prisma.expense.count({ where });

  res.json({ success: true, data: expenses, total, page: parseInt(page), pages: Math.ceil(total / limit) });
};

exports.getPendingApprovals = async (req, res) => {
  const expenses = await prisma.expense.findMany({
    where: {
      status: 'PENDING',
      companyId: req.user.companyId,
      approvalRule: {
        steps: {
          some: {
            approverId: req.user.id,
          }
        }
      }
    },
    include: { employee: { select: { name: true } }, approvalRule: { include: { steps: true } } }
  });

  // Filter out the ones where it is actually this user's turn
  const filtered = expenses.filter(e => {
    const currentStep = e.approvalRule.steps.find(s => s.stepOrder === e.currentStepIndex + 1);
    return currentStep && currentStep.approverId === req.user.id;
  });

  res.json({ success: true, data: filtered });
};

exports.getExpenseById = async (req, res) => {
  const expense = await prisma.expense.findUnique({
    where: { id: req.params.id },
    include: {
      employee: { select: { name: true, email: true, role: true } },
      logs: { include: { approver: { select: { name: true, role: true } } }, orderBy: { createdAt: 'asc' } },
      approvalRule: { include: { steps: { include: { approver: { select: { name: true, role: true } } }, orderBy: { stepOrder: 'asc' } } } }
    }
  });
  if (!expense || (req.user.role === 'EMPLOYEE' && expense.employeeId !== req.user.id)) {
    throw new Error('Expense not found or unauthorized');
  }
  res.json({ success: true, data: expense });
};

exports.uploadOCR = async (req, res) => {
  if (!req.file) return res.json({ success: false, message: "Fill fields manually" });

  try {
    const compressedPath = req.file.path + '-compressed.jpg';
    await sharp(req.file.path).resize(1200).jpeg({ quality: 80 }).toFile(compressedPath);

    const result = await Tesseract.recognize(compressedPath, 'eng');
    const text = result.data.text;
    
    // Very naive regex example for amounts and dates
    const amountMatch = text.match(/\$?\s?(\d{1,3}(,\d{3})*(\.\d{2})?)/);
    const dateMatch = text.match(/\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/);

    res.json({
      success: true,
      data: {
        amount: amountMatch ? amountMatch[1] : null,
        date: dateMatch ? dateMatch[0] : null,
        description: "",
        rawText: text
      }
    });
  } catch(e) {
    res.json({ success: true, data: {}, message: "Fill fields manually" });
  }
};

exports.cancelExpense = async (req, res) => {
  const expense = await prisma.expense.findUnique({ where: { id: req.params.id } });
  if (!expense || expense.employeeId !== req.user.id || expense.status !== 'PENDING') {
    throw new Error('Cannot cancel this expense');
  }
  const updated = await prisma.expense.update({ where: { id: expense.id }, data: { status: 'CANCELLED' } });
  res.json({ success: true, data: updated });
};

exports.overrideExpense = async (req, res) => {
  const { action, comment } = req.body;
  if (!['APPROVED', 'REJECTED'].includes(action)) throw new Error('Invalid action');
  
  const updated = await prisma.expense.update({ where: { id: req.params.id }, data: { status: action, rejectionReason: comment }});
  await prisma.approvalLog.create({
     data: { expenseId: req.params.id, approverId: req.user.id, action: 'ESCALATED', comment, stepIndex: updated.currentStepIndex }
  });
  res.json({ success: true, data: updated });
};

exports.getExchangeRate = async (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) {
    return res.status(400).json({ success: false, message: 'from and to currencies are required' });
  }
  if (from === to) {
    return res.json({ success: true, rate: 1 });
  }
  const { rate } = await convertAmount(1, from, to);
  res.json({ success: true, rate });
};