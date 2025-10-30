export class AppError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status || 500;
    this.details = details;
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not Found', details) {
    super(404, message, details);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation Error', details) {
    super(400, message, details);
  }
}

// PUBLIC_INTERFACE
export function notFoundHandler(req, res, next) {
  /** Express 404 handler for unmatched routes */
  next(new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`));
}

// PUBLIC_INTERFACE
export function errorHandler(err, req, res, _next) {
  /**
   * Centralized Express error handler.
   * Returns JSON: { error: { message, details? } }
   */
  const status = err.status || 500;
  const payload = {
    error: {
      message: err.message || 'Internal Server Error'
    }
  };
  if (err.details) payload.error.details = err.details;

  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
  res.status(status).json(payload);
}
