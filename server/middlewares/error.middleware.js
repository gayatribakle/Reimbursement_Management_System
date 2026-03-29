const { ZodError } = require('zod');

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'Internal server error';
  let code = 'SERVER_ERROR';
  let errors = undefined;

  // Zod Validation Errors
  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    code = 'VALIDATION_ERROR';
    errors = err.errors.map(e => ({ field: e.path.join('.'), message: e.message }));
  }
  // JWT Errors
  else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Invalid or expired token';
    code = 'UNAUTHORIZED';
  }
  // Prisma Errors
  else if (err.code === 'P2002') {
    statusCode = 409;
    message = 'Record already exists';
    code = 'CONFLICT';
  } else if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found';
    code = 'NOT_FOUND';
  }

  // Ensure response
  res.status(statusCode).json({
    success: false,
    message,
    code,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
