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
    if (userId) socket.join(`user:${userId}`);
    if (companyId) socket.join(`company:${companyId}`);
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
    console.log(`✅ Server running on port ${PORT}`);
  });
});