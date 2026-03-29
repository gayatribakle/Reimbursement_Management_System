const ApprovalEngine = require('../services/approvalEngine.service');
const { prisma } = require('../config/db');

exports.approveExpense = async (req, res) => {
  const { comment } = req.body;
  const io = req.app.get('io');
  const updated = await ApprovalEngine.processAction(req.params.id, req.user.id, 'APPROVED', comment, io);
  res.json({ success: true, data: updated });
};

exports.rejectExpense = async (req, res) => {
  const { comment } = req.body;
  if (!comment) {
    const err = new Error('Comment is required for rejection'); err.statusCode = 400; throw err;
  }
  const io = req.app.get('io');
  const updated = await ApprovalEngine.processAction(req.params.id, req.user.id, 'REJECTED', comment, io);
  res.json({ success: true, data: updated });
};

exports.getApprovalTimeline = async (req, res) => {
  const logs = await prisma.approvalLog.findMany({
    where: { expenseId: req.params.id },
    include: { approver: { select: { name: true } } },
    orderBy: { createdAt: 'asc' }
  });
  res.json({ success: true, data: logs });
};