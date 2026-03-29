const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/approval.controller');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth.middleware');

router.use(authenticateToken);

router.post('/:id/approve', authorizeRoles('ADMIN', 'MANAGER', 'FINANCE', 'DIRECTOR'), ctrl.approveExpense);
router.post('/:id/reject', authorizeRoles('ADMIN', 'MANAGER', 'FINANCE', 'DIRECTOR'), ctrl.rejectExpense);
router.get('/:id/timeline', ctrl.getApprovalTimeline);

module.exports = router;