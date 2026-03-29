const { prisma } = require('../config/db');
const bcrypt = require('bcryptjs');

exports.getUsers = async (req, res) => {
  const { page = 1, limit = 10, role } = req.query;
  const skip = (page - 1) * limit;
  const where = { companyId: req.user.companyId };
  if (role) where.role = role;

  const users = await prisma.user.findMany({
    where, skip: parseInt(skip), take: parseInt(limit),
    select: { id: true, name: true, email: true, role: true, isManagerApprover: true, manager: { select: { name: true } } },
  });
  const total = await prisma.user.count({ where });

  res.json({ success: true, data: users, total, page: parseInt(page), pages: Math.ceil(total / limit) });
};

exports.createUser = async (req, res) => {
  const { name, email, password, role, managerId } = req.body;
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  const newUser = await prisma.user.create({
    data: { name, email, passwordHash, role, managerId, companyId: req.user.companyId },
    select: { id: true, name: true, email: true, role: true }
  });
  res.status(201).json({ success: true, user: newUser });
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { role, managerId, isManagerApprover, name } = req.body;
  if (req.user.id === id && role && role !== req.user.role) {
    throw new Error('Cannot change your own role');
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { role, managerId, isManagerApprover, name },
    select: { id: true, name: true, email: true, role: true }
  });
  res.json({ success: true, user: updated });
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  if (req.user.id === id) throw new Error('Cannot delete yourself');

  await prisma.user.delete({ where: { id } });
  res.json({ success: true, message: 'User deleted' });
};

exports.getManagers = async (req, res) => {
  const managers = await prisma.user.findMany({
    where: { companyId: req.user.companyId, role: { in: ['MANAGER', 'ADMIN', 'FINANCE', 'DIRECTOR'] } },
    select: { id: true, name: true, role: true }
  });
  res.json({ success: true, data: managers });
};

exports.getTeamExpenses = async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const teamMembers = await prisma.user.findMany({
    where: { managerId: req.user.id },
    select: { id: true }
  });
  const teamIds = teamMembers.map(u => u.id);

  const where = { employeeId: { in: teamIds } };
  if (status) where.status = status;

  const expenses = await prisma.expense.findMany({
    where, skip: parseInt(skip), take: parseInt(limit),
    include: { employee: { select: { name: true } }, logs: true },
    orderBy: { createdAt: 'desc' }
  });
  const total = await prisma.expense.count({ where });

  res.json({ success: true, data: expenses, total, page: parseInt(page), pages: Math.ceil(total / limit) });
};