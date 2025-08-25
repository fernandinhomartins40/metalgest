const { v4: uuidv4 } = require('uuid');
const database = require('../config/database');

class AuditService {
  async log(userId, action, module, details = null, req = null) {
    try {
      const auditId = uuidv4();
      const ipAddress = req?.ip || req?.connection?.remoteAddress || req?.socket?.remoteAddress;
      const userAgent = req?.get?.('User-Agent') || req?.headers?.['user-agent'];

      await database.run(`
        INSERT INTO audit_logs (
          id, user_id, action, module, details, ip_address, user_agent, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [
        auditId,
        userId,
        action,
        module,
        details ? JSON.stringify(details) : null,
        ipAddress,
        userAgent
      ]);

      return auditId;
    } catch (error) {
      console.error('Audit log error:', error);
      // Don't throw error to avoid breaking main functionality
    }
  }

  async getLogs(userId, filters = {}) {
    try {
      const { page = 1, limit = 50, module, action, startDate, endDate } = filters;
      const offset = (page - 1) * limit;

      let query = 'SELECT * FROM audit_logs WHERE user_id = ?';
      const params = [userId];

      if (module) {
        query += ' AND module = ?';
        params.push(module);
      }

      if (action) {
        query += ' AND action = ?';
        params.push(action);
      }

      if (startDate) {
        query += ' AND created_at >= ?';
        params.push(startDate);
      }

      if (endDate) {
        query += ' AND created_at <= ?';
        params.push(endDate);
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), offset);

      const logs = await database.all(query, params);

      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) as total FROM audit_logs WHERE user_id = ?';
      const countParams = [userId];

      if (module) {
        countQuery += ' AND module = ?';
        countParams.push(module);
      }

      if (action) {
        countQuery += ' AND action = ?';
        countParams.push(action);
      }

      if (startDate) {
        countQuery += ' AND created_at >= ?';
        countParams.push(startDate);
      }

      if (endDate) {
        countQuery += ' AND created_at <= ?';
        countParams.push(endDate);
      }

      const { total } = await database.get(countQuery, countParams);

      // Parse JSON details
      const parsedLogs = logs.map(log => ({
        ...log,
        details: log.details ? JSON.parse(log.details) : null
      }));

      return {
        data: parsedLogs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Get audit logs error:', error);
      throw error;
    }
  }

  async getLogById(userId, logId) {
    try {
      const log = await database.get(
        'SELECT * FROM audit_logs WHERE id = ? AND user_id = ?',
        [logId, userId]
      );

      if (!log) {
        return null;
      }

      return {
        ...log,
        details: log.details ? JSON.parse(log.details) : null
      };
    } catch (error) {
      console.error('Get audit log by ID error:', error);
      throw error;
    }
  }

  async deleteOldLogs(daysToKeep = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      const result = await database.run(
        'DELETE FROM audit_logs WHERE created_at < ?',
        [cutoffDate.toISOString()]
      );

      console.log(`Deleted ${result.changes} old audit logs`);
      return result.changes;
    } catch (error) {
      console.error('Delete old audit logs error:', error);
      throw error;
    }
  }

  async getModuleStats(userId, startDate = null, endDate = null) {
    try {
      let query = `
        SELECT 
          module,
          COUNT(*) as count,
          COUNT(DISTINCT action) as unique_actions
        FROM audit_logs 
        WHERE user_id = ?
      `;
      const params = [userId];

      if (startDate) {
        query += ' AND created_at >= ?';
        params.push(startDate);
      }

      if (endDate) {
        query += ' AND created_at <= ?';
        params.push(endDate);
      }

      query += ' GROUP BY module ORDER BY count DESC';

      const stats = await database.all(query, params);
      return stats;
    } catch (error) {
      console.error('Get module stats error:', error);
      throw error;
    }
  }

  async getActionStats(userId, module = null, startDate = null, endDate = null) {
    try {
      let query = `
        SELECT 
          action,
          COUNT(*) as count
        FROM audit_logs 
        WHERE user_id = ?
      `;
      const params = [userId];

      if (module) {
        query += ' AND module = ?';
        params.push(module);
      }

      if (startDate) {
        query += ' AND created_at >= ?';
        params.push(startDate);
      }

      if (endDate) {
        query += ' AND created_at <= ?';
        params.push(endDate);
      }

      query += ' GROUP BY action ORDER BY count DESC';

      const stats = await database.all(query, params);
      return stats;
    } catch (error) {
      console.error('Get action stats error:', error);
      throw error;
    }
  }

  // Helper methods for common audit actions
  async logCreate(userId, module, resourceId, resourceData, req = null) {
    return this.log(userId, 'create', module, {
      resourceId,
      resourceData
    }, req);
  }

  async logUpdate(userId, module, resourceId, changes, req = null) {
    return this.log(userId, 'update', module, {
      resourceId,
      changes
    }, req);
  }

  async logDelete(userId, module, resourceId, resourceData, req = null) {
    return this.log(userId, 'delete', module, {
      resourceId,
      resourceData
    }, req);
  }

  async logView(userId, module, resourceId, req = null) {
    return this.log(userId, 'view', module, {
      resourceId
    }, req);
  }

  async logList(userId, module, filters, count, req = null) {
    return this.log(userId, 'list', module, {
      filters,
      count
    }, req);
  }

  async logSearch(userId, module, query, count, req = null) {
    return this.log(userId, 'search', module, {
      query,
      count
    }, req);
  }
}

module.exports = new AuditService();