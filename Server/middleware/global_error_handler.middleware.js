const globalErrorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || "Algo salió mal";

  const errorResponse = {
    status,
    message,
  };

  if (err.data) {
    errorResponse.errors = err.data;
  }

  res.status(status).json(errorResponse);
};

export default globalErrorHandler;
