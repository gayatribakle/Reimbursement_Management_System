const { prisma } = require('../config/db');

class ApprovalEngine {
  static async processAction(expenseId, approverId, action, comment, io) {
    // STEP 1: Fetch expense with full relations
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
      include: {
        approvalRule: {
          include: {
            steps: { orderBy: { stepOrder: 'asc' } }
          }
        },
        logs: true,
        employee: true,
        company: true
      }
    });
    
    if (!expense) throw new Error('Expense not found');
    if (expense.status !== 'PENDING') throw new Error('Expense is no longer pending');
    
    const steps = expense.approvalRule.steps;
    const currentStep = steps[expense.currentStepIndex];
    
    // STEP 2: Validate this approver is correct for step
    if (currentStep.approverId !== approverId) {
      throw Object.assign(
        new Error('Not authorized to action this step'),
        { statusCode: 403 }
      );
    }
    
    // STEP 3: ALWAYS create the ApprovalLog first
    await prisma.approvalLog.create({
      data: {
        expenseId,
        approverId,
        action,
        comment: comment || null,
        stepIndex: expense.currentStepIndex
      }
    });
    
    // STEP 4: Handle REJECTION
    if (action === 'REJECTED') {
      await prisma.expense.update({
        where: { id: expenseId },
        data: {
          status: 'REJECTED',
          rejectionReason: comment || null
        }
      });
      if (io) {
        io.to(`user:${expense.employeeId}`).emit('expense:rejected', { expenseId });
        io.to(`company:${expense.companyId}`).emit('expense:updated', { expenseId });
      }
      return;
    }
    
    // STEP 5: Handle APPROVAL — evaluate rule
    const totalSteps = steps.length;
    const nextIndex = expense.currentStepIndex + 1;
    
    const approvedCount = await prisma.approvalLog.count({
      where: { expenseId, action: 'APPROVED' }
    });
    
    let newStatus = 'PENDING';
    let newStepIndex = expense.currentStepIndex;
    let fullyApproved = false;
    const ruleType = expense.approvalRule.ruleType;
    
    if (ruleType === 'SEQUENTIAL') {
      if (nextIndex >= totalSteps) {
        fullyApproved = true;
      } else {
        newStepIndex = nextIndex;
      }
    } else if (ruleType === 'PERCENTAGE') {
      const ratio = (approvedCount / totalSteps) * 100;
      if (ratio >= (expense.approvalRule.percentageThreshold || 100)) {
        fullyApproved = true;
      } else if (nextIndex < totalSteps) {
        newStepIndex = nextIndex;
      }
    } else if (ruleType === 'SPECIFIC') {
      if (approverId === expense.approvalRule.specificApproverId) {
        fullyApproved = true;
      } else if (nextIndex < totalSteps) {
        newStepIndex = nextIndex;
      }
    } else if (ruleType === 'HYBRID') {
      const ratio = (approvedCount / totalSteps) * 100;
      const pctOk = ratio >= (expense.approvalRule.percentageThreshold || 100);
      const specOk = approverId === expense.approvalRule.specificApproverId;
      if (pctOk || specOk) {
        fullyApproved = true;
      } else if (nextIndex < totalSteps) {
        newStepIndex = nextIndex;
      }
    }
    
    // STEP 6: Update expense status
    if (fullyApproved) {
      newStatus = 'APPROVED';
    }
    
    const updated = await prisma.expense.update({
      where: { id: expenseId },
      data: {
        status: newStatus,
        currentStepIndex: newStepIndex
      }
    });
    
    // STEP 7: Emit socket events
    if (io) {
      if (fullyApproved) {
        io.to(`user:${expense.employeeId}`).emit('expense:approved', { expenseId });
      } else {
        const nextApproverId = steps[newStepIndex].approverId;
        io.to(`user:${nextApproverId}`).emit('expense:nextStep', { expenseId });
        io.to(`user:${expense.employeeId}`).emit('expense:updated', { expenseId });
      }
      io.to(`company:${expense.companyId}`).emit('expense:updated', { expenseId });
    }
    return updated;
  }
}

module.exports = ApprovalEngine;
