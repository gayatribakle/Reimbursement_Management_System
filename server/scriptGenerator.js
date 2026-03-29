const fs = require('fs');
const path = require('path');

const writeFiles = () => {
  // server/controllers/user.controller.js
  const userCtrl = `
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
    where: { companyId: req.user.companyId, role: { in: ['MANAGER', 'ADMIN'] } },
    select: { id: true, name: true, role: true }
  });
  res.json({ success: true, data: managers });
};
`;

  // server/controllers/expense.controller.js
  const expCtrl = `
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
  if (io) io.to(\`company:\${req.user.companyId}\`).emit('expense:submitted', expense);

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
    include: { logs: { include: { approver: { select: { name: true } } } } }
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
    const amountMatch = text.match(/\\$?\\s?(\\d{1,3}(,\\d{3})*(\\.\\d{2})?)/);
    const dateMatch = text.match(/\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4}/);

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
`;

  // server/controllers/approval.controller.js
  const appCtrl = `
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
`;

  // server/controllers/rule.controller.js
  const ruleCtrl = `
const { prisma } = require('../config/db');

exports.getRules = async (req, res) => {
  const rules = await prisma.approvalRule.findMany({
    where: { companyId: req.user.companyId },
    include: { steps: { orderBy: { stepOrder: 'asc' } }, specificApprover: { select: { name: true } } }
  });
  res.json({ success: true, data: rules });
};

exports.createRule = async (req, res) => {
  const { name, ruleType, steps, percentageThreshold, specificApproverId } = req.body;
  
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
`;

  // server/routes/user.routes.js
  const userRts = `
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/user.controller');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth.middleware');

router.use(authenticateToken);

router.get('/', authorizeRoles('ADMIN', 'MANAGER'), ctrl.getUsers);
router.post('/', authorizeRoles('ADMIN'), ctrl.createUser);
router.get('/managers', authorizeRoles('ADMIN', 'MANAGER'), ctrl.getManagers);
router.put('/:id', authorizeRoles('ADMIN'), ctrl.updateUser);
router.delete('/:id', authorizeRoles('ADMIN'), ctrl.deleteUser);

module.exports = router;
`;

  // server/routes/expense.routes.js
  const expRts = `
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

router.get('/', (req, res) => {
  if (req.user.role === 'EMPLOYEE') return ctrl.getMyExpenses(req, res);
  return ctrl.getAllExpenses(req, res);
});

router.post('/', upload.single('receipt'), authorizeRoles('EMPLOYEE'), ctrl.submitExpense);
router.get('/pending', authorizeRoles('ADMIN', 'MANAGER'), ctrl.getPendingApprovals);
router.get('/:id', ctrl.getExpenseById);
router.post('/:id/ocr', upload.single('receipt'), authorizeRoles('EMPLOYEE'), ctrl.uploadOCR);
router.patch('/:id/cancel', authorizeRoles('EMPLOYEE'), ctrl.cancelExpense);
router.patch('/:id/override', authorizeRoles('ADMIN'), ctrl.overrideExpense);

module.exports = router;
`;

  // server/routes/approval.routes.js
  const appRts = `
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/approval.controller');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth.middleware');

router.use(authenticateToken);

router.post('/:id/approve', authorizeRoles('ADMIN', 'MANAGER'), ctrl.approveExpense);
router.post('/:id/reject', authorizeRoles('ADMIN', 'MANAGER'), ctrl.rejectExpense);
router.get('/:id/timeline', ctrl.getApprovalTimeline);

module.exports = router;
`;

  // server/routes/rule.routes.js
  const ruleRts = `
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/rule.controller');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth.middleware');

router.use(authenticateToken);
router.use(authorizeRoles('ADMIN'));

router.get('/', ctrl.getRules);
router.post('/', ctrl.createRule);
router.put('/:id', ctrl.updateRule);
router.delete('/:id', ctrl.deleteRule);
router.patch('/:id/default', ctrl.setDefault);

module.exports = router;
`;

  // server/server.js
  const mainServer = `
require('dotenv').config();
require('express-async-errors'); // must be loaded before express app
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');
const { connectDB } = require('./config/db');
const errorHandler = require('./middlewares/error.middleware');

const app = express();
const server = http.createServer(app);

// Socket.IO
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', methods: ['GET', 'POST'], credentials: true }
});
app.set('io', io);

io.on('connection', (socket) => {
  socket.on('join', ({ userId, companyId }) => {
    if (userId) socket.join(\`user:\${userId}\`);
    if (companyId) socket.join(\`company:\${companyId}\`);
  });
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(helmet());
app.use(morgan('dev'));

// Static files
const fs = require('fs');
if (!fs.existsSync(process.env.UPLOAD_DIR || 'uploads')) {
  fs.mkdirSync(process.env.UPLOAD_DIR || 'uploads');
}
app.use('/uploads', express.static(process.env.UPLOAD_DIR || 'uploads'));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/expenses', require('./routes/expense.routes'));
app.use('/api/approvals', require('./routes/approval.routes'));
app.use('/api/rules', require('./routes/rule.routes'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', db: 'connected' }));

// Global Error Handler
app.use(errorHandler);

// Connect DB + Start
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(\`✅ Server running on port \${PORT}\`);
  });
});
`;

  const bFile = (p, data) => fs.writeFileSync(path.join(__dirname, p), data.trim());

  bFile('controllers/user.controller.js', userCtrl);
  bFile('controllers/expense.controller.js', expCtrl);
  bFile('controllers/approval.controller.js', appCtrl);
  bFile('controllers/rule.controller.js', ruleCtrl);

  bFile('routes/user.routes.js', userRts);
  bFile('routes/expense.routes.js', expRts);
  bFile('routes/approval.routes.js', appRts);
  bFile('routes/rule.routes.js', ruleRts);
  
  bFile('server.js', mainServer);

  console.log('Successfully generated all remaining backend files.');
};

writeFiles();
