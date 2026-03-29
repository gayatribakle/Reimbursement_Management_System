const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/expense.controller');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth.middleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, process.env.UPLOAD_DIR || 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.use(authenticateToken);

router.get('/rate', ctrl.getExchangeRate);

router.get('/', (req, res) => {
  if (req.user.role === 'EMPLOYEE') return ctrl.getMyExpenses(req, res);
  return ctrl.getAllExpenses(req, res);
});

router.post('/', upload.single('receipt'), authorizeRoles('EMPLOYEE'), ctrl.submitExpense);
router.get('/pending', authorizeRoles('ADMIN', 'MANAGER', 'FINANCE', 'DIRECTOR'), ctrl.getPendingApprovals);
router.get('/:id', ctrl.getExpenseById);
router.post('/ocr-scan', upload.single('receipt'), authorizeRoles('EMPLOYEE'), ctrl.uploadOCR);
router.post('/:id/ocr', upload.single('receipt'), authorizeRoles('EMPLOYEE'), ctrl.uploadOCR);
router.patch('/:id/cancel', authorizeRoles('EMPLOYEE'), ctrl.cancelExpense);
router.patch('/:id/override', authorizeRoles('ADMIN'), ctrl.overrideExpense);

module.exports = router;