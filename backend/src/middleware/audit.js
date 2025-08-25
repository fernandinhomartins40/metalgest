const auditService = require('../services/audit.service');

// Middleware para capturar e registrar atividades de auditoria
const auditMiddleware = (action, tableName) => {
  return (req, res, next) => {
    // Store original methods
    const originalSend = res.send;
    const originalJson = res.json;

    // Override res.send
    res.send = function(body) {
      res.send = originalSend;
      
      // Log audit after successful response
      if (res.statusCode < 400 && req.user) {
        setImmediate(() => {
          auditService.log({
            user_id: req.user.id,
            action: action,
            table_name: tableName,
            record_id: req.params.id ? parseInt(req.params.id) : null,
            old_values: req.auditOldValues || null,
            new_values: req.auditNewValues || null,
            ip: req.ip,
            user_agent: req.get('User-Agent')
          });
        });
      }
      
      return originalSend.call(this, body);
    };

    // Override res.json
    res.json = function(body) {
      res.json = originalJson;
      
      // Log audit after successful response
      if (res.statusCode < 400 && req.user) {
        setImmediate(() => {
          auditService.log({
            user_id: req.user.id,
            action: action,
            table_name: tableName,
            record_id: req.params.id ? parseInt(req.params.id) : null,
            old_values: req.auditOldValues || null,
            new_values: req.auditNewValues || null,
            ip: req.ip,
            user_agent: req.get('User-Agent')
          });
        });
      }
      
      return originalJson.call(this, body);
    };

    next();
  };
};

// Middleware para capturar valores antigos antes de UPDATE/DELETE
const captureOldValues = (model, tableName) => {
  return async (req, res, next) => {
    try {
      if (req.params.id && req.user) {
        // Para modelos que requerem userId
        const oldRecord = await model.findById(req.params.id, req.user.id);
        if (oldRecord) {
          req.auditOldValues = oldRecord;
        }
      }
    } catch (error) {
      console.error('Error capturing old values for audit:', error);
    }
    
    next();
  };
};

// Middleware para capturar novos valores após CREATE/UPDATE
const captureNewValues = (responseData) => {
  return (req, res, next) => {
    req.auditNewValues = responseData;
    next();
  };
};

// Middleware específico para diferentes ações
const auditCreate = (tableName) => auditMiddleware('CREATE', tableName);
const auditUpdate = (tableName) => auditMiddleware('UPDATE', tableName);
const auditDelete = (tableName) => auditMiddleware('DELETE', tableName);
const auditRead = (tableName) => auditMiddleware('READ', tableName);
const auditList = (tableName) => auditMiddleware('LIST', tableName);

// Middleware combinado para operações que precisam de valores antigos
const auditWithOldValues = (action, tableName, model) => {
  return [
    captureOldValues(model, tableName),
    auditMiddleware(action, tableName)
  ];
};

// Utilitário para log manual de auditoria
const logAudit = async (req, action, tableName, recordId = null, oldValues = null, newValues = null) => {
  if (req.user) {
    try {
      await auditService.log({
        user_id: req.user.id,
        action: action,
        table_name: tableName,
        record_id: recordId,
        old_values: oldValues,
        new_values: newValues,
        ip: req.ip,
        user_agent: req.get('User-Agent')
      });
    } catch (error) {
      console.error('Error logging audit:', error);
    }
  }
};

// Middleware para audit logs administrativos
const adminAuditMiddleware = (action) => {
  return (req, res, next) => {
    // Verificar se é admin
    if (!req.user || req.user.role !== 'admin') {
      return next();
    }

    const originalSend = res.send;
    const originalJson = res.json;

    res.send = function(body) {
      res.send = originalSend;
      
      if (res.statusCode < 400) {
        setImmediate(() => {
          auditService.log({
            user_id: req.user.id,
            action: `ADMIN_${action}`,
            table_name: 'system',
            record_id: null,
            old_values: null,
            new_values: { endpoint: req.originalUrl, method: req.method },
            ip: req.ip,
            user_agent: req.get('User-Agent')
          });
        });
      }
      
      return originalSend.call(this, body);
    };

    res.json = function(body) {
      res.json = originalJson;
      
      if (res.statusCode < 400) {
        setImmediate(() => {
          auditService.log({
            user_id: req.user.id,
            action: `ADMIN_${action}`,
            table_name: 'system',
            record_id: null,
            old_values: null,
            new_values: { endpoint: req.originalUrl, method: req.method },
            ip: req.ip,
            user_agent: req.get('User-Agent')
          });
        });
      }
      
      return originalJson.call(this, body);
    };

    next();
  };
};

// Middleware para capturar mudanças de senha
const auditPasswordChange = () => {
  return auditMiddleware('PASSWORD_CHANGE', 'users');
};

// Middleware para capturar login/logout
const auditAuth = (action) => {
  return (req, res, next) => {
    const originalSend = res.send;
    const originalJson = res.json;

    res.send = function(body) {
      res.send = originalSend;
      
      if (res.statusCode < 400) {
        setImmediate(() => {
          auditService.log({
            user_id: req.user?.id || null,
            action: action,
            table_name: 'auth',
            record_id: req.user?.id || null,
            old_values: null,
            new_values: { 
              email: req.body.email || req.user?.email,
              success: true 
            },
            ip: req.ip,
            user_agent: req.get('User-Agent')
          });
        });
      } else {
        // Log failed attempts
        setImmediate(() => {
          auditService.log({
            user_id: null,
            action: `${action}_FAILED`,
            table_name: 'auth',
            record_id: null,
            old_values: null,
            new_values: { 
              email: req.body.email,
              success: false,
              error: 'Authentication failed'
            },
            ip: req.ip,
            user_agent: req.get('User-Agent')
          });
        });
      }
      
      return originalSend.call(this, body);
    };

    res.json = function(body) {
      res.json = originalJson;
      
      if (res.statusCode < 400) {
        setImmediate(() => {
          auditService.log({
            user_id: req.user?.id || null,
            action: action,
            table_name: 'auth',
            record_id: req.user?.id || null,
            old_values: null,
            new_values: { 
              email: req.body.email || req.user?.email,
              success: true 
            },
            ip: req.ip,
            user_agent: req.get('User-Agent')
          });
        });
      } else {
        setImmediate(() => {
          auditService.log({
            user_id: null,
            action: `${action}_FAILED`,
            table_name: 'auth',
            record_id: null,
            old_values: null,
            new_values: { 
              email: req.body.email,
              success: false,
              error: body.error?.message || 'Authentication failed'
            },
            ip: req.ip,
            user_agent: req.get('User-Agent')
          });
        });
      }
      
      return originalJson.call(this, body);
    };

    next();
  };
};

module.exports = {
  auditMiddleware,
  captureOldValues,
  captureNewValues,
  auditCreate,
  auditUpdate,
  auditDelete,
  auditRead,
  auditList,
  auditWithOldValues,
  logAudit,
  adminAuditMiddleware,
  auditPasswordChange,
  auditAuth
};