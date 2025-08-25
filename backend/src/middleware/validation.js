const { z } = require('zod');

// Middleware to validate request body using Zod schema
const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        return res.status(400).json({
          success: false,
          error: { 
            message: 'Validation failed',
            details: formattedErrors
          }
        });
      }

      return res.status(500).json({
        success: false,
        error: { message: 'Internal server error during validation' }
      });
    }
  };
};

// Middleware to validate query parameters
const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        return res.status(400).json({
          success: false,
          error: { 
            message: 'Query validation failed',
            details: formattedErrors
          }
        });
      }

      return res.status(500).json({
        success: false,
        error: { message: 'Internal server error during validation' }
      });
    }
  };
};

// Middleware to validate route parameters
const validateParams = (schema) => {
  return (req, res, next) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));

        return res.status(400).json({
          success: false,
          error: { 
            message: 'Parameter validation failed',
            details: formattedErrors
          }
        });
      }

      return res.status(500).json({
        success: false,
        error: { message: 'Internal server error during validation' }
      });
    }
  };
};

module.exports = {
  validateBody,
  validateQuery,
  validateParams
};