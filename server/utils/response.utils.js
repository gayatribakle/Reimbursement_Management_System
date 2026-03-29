const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data && { data },
  });
};

const sendError = (res, message = 'Something went wrong', statusCode = 400, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...errors && { errors },
  });
};

module.exports = { sendSuccess, sendError };
