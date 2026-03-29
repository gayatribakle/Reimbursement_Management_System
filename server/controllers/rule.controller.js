const { prisma } = require('../config/db');

// Validation helper
const validateApprovers = async (companyId, approverIds) => {
  if (!approverIds || approverIds.length === 0) return true;
  const users = await prisma.user.findMany({
    where: { id: { in: approverIds }, companyId }
  });
  if (users.length !== approverIds.length) throw new Error('Some approvers are invalid or from another company');
  const validRoles = ['ADMIN', 'MANAGER', 'FINANCE', 'DIRECTOR'];
  for (const u of users) {
    if (!validRoles.includes(u.role)) {
      throw new Error(`User ${u.name} cannot be an approver (Role: ${u.role})`);
    }
  }
};

exports.getRules = async (req, res) => {
  const rules = await prisma.approvalRule.findMany({
    where: { companyId: req.user.companyId },
    include: { steps: { orderBy: { stepOrder: 'asc' } }, specificApprover: { select: { name: true } } }
  });
  res.json({ success: true, data: rules });
};

exports.createRule = async (req, res) => {
  const { name, ruleType, steps, percentageThreshold, specificApproverId } = req.body;
  
  const approverIds = steps.map(s => s.approverId);
  if (specificApproverId) approverIds.push(specificApproverId);
  await validateApprovers(req.user.companyId, approverIds);
  
  const rule = await prisma.$transaction(async (tx) => {
    if (req.body.isDefault) {
      await tx.approvalRule.updateMany({ where: { companyId: req.user.companyId }, data: { isDefault: false }});
    }
    return await tx.approvalRule.create({
      data: {
        companyId: req.user.companyId,
        name, ruleType, percentageThreshold, specificApproverId, isDefault: req.body.isDefault || false,
        steps: { create: steps.map((s, i) => ({ stepOrder: i + 1, approverId: s.approverId })) }
      },
      include: { steps: true }
    });
  });
  res.status(201).json({ success: true, data: rule });
};

exports.updateRule = async (req, res) => {
  const { id } = req.params;
  const { name, ruleType, steps, percentageThreshold, specificApproverId } = req.body;

  const approverIds = steps.map(s => s.approverId);
  if (specificApproverId) approverIds.push(specificApproverId);
  await validateApprovers(req.user.companyId, approverIds);

  const rule = await prisma.$transaction(async (tx) => {
    await tx.approvalStep.deleteMany({ where: { ruleId: id } });
    return await tx.approvalRule.update({
      where: { id },
      data: {
        name, ruleType, percentageThreshold, specificApproverId,
        steps: { create: steps.map((s, i) => ({ stepOrder: i + 1, approverId: s.approverId })) }
      },
      include: { steps: true }
    });
  });
  res.json({ success: true, data: rule });
};

exports.deleteRule = async (req, res) => {
  const activeExpenses = await prisma.expense.count({ where: { approvalRuleId: req.params.id, status: 'PENDING' } });
  if (activeExpenses > 0) throw new Error('Cannot delete rule in use by pending expenses');

  await prisma.approvalRule.delete({ where: { id: req.params.id } });
  res.json({ success: true, message: 'Rule deleted' });
};

exports.setDefault = async (req, res) => {
  await prisma.$transaction(async (tx) => {
    await tx.approvalRule.updateMany({ where: { companyId: req.user.companyId }, data: { isDefault: false }});
    await tx.approvalRule.update({ where: { id: req.params.id }, data: { isDefault: true }});
  });
  res.json({ success: true, message: 'Default rule updated' });
};