import logger from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  // Determine status code
  const statusCode = err.statusCode || res.statusCode || 500;
  res.status(statusCode);

  // Build a normalized validation errors array for response
  let validationErrors = null;
  // Helper: try multiple strategies to extract a field name from a validator error
  const extractFieldName = (e) => {
    if (!e) return null;
    // common express-validator shape: { param }
    if (e.param) return e.param;
    // mongoose/v8 validators sometimes use path
    if (e.path) return e.path;
    if (e.field) return e.field;
    if (e.propertyPath) return e.propertyPath;
    // sometimes nested inside properties
    if (e.properties && (e.properties.path || e.properties.param)) return e.properties.path || e.properties.param;
    // fallback: try to parse the message text (e.g. "Password must be at least 8 characters long")
    if (e.msg && typeof e.msg === 'string') {
      const m = e.msg.match(/^([A-Za-z ]+?)(?:\s|$)/);
      if (m && m[1]) return m[1].replace(/\s+/g, '').toLowerCase();
    }
    if (e.message && typeof e.message === 'string') {
      const m2 = e.message.match(/^([A-Za-z ]+?)(?:\s|$)/);
      if (m2 && m2[1]) return m2[1].replace(/\s+/g, '').toLowerCase();
    }
    return null;
  };

  // Mongoose ValidationError (err.name === 'ValidationError')
  if (err.name === 'ValidationError' && err.errors && typeof err.errors === 'object') {
    validationErrors = Object.values(err.errors).map((e) => ({
      field: extractFieldName(e) || null,
      message: e.message || (e.properties && e.properties.message) || 'Invalid value',
      original: process.env.NODE_ENV === 'production' ? undefined : e,
    }));
  }


  else if (err.errors && Array.isArray(err.errors)) {
    validationErrors = err.errors.map((e) => ({
      field: extractFieldName(e) || null,
      message: e.msg || e.message || 'Invalid value',
      original: process.env.NODE_ENV === 'production' ? undefined : e,
    }));
  }

  logger.error({
    message: err.message,
    name: err.name,
    stack: err.stack,
    statusCode,
    path: req.originalUrl,
    method: req.method,
    validationErrors,
  });

 
  res.json({
    timestamp: new Date().toISOString(),
    message: err.message || 'Internal Server Error',
    name: err.name || 'Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    errors: validationErrors,
  });
};
