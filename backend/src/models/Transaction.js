const { Database } = require('../config/database');
const EncryptionUtils = require('../utils/encryption');

class Transaction {
  constructor() {
    this.db = new Database();
  }

  async findById(id, userId) {
    return await this.db.get(`
      SELECT 
        t.*,
        c.name as client_name,
        c.email as client_email,
        q.title as quote_title,
        q.public_id as quote_public_id,
        u.name as created_by_name
      FROM transactions t
      LEFT JOIN clients c ON t.client_id = c.id
      LEFT JOIN quotes q ON t.quote_id = q.id
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.id = ? AND t.created_by = ? AND t.deleted_at IS NULL
    `, [id, userId]);
  }

  async create(transactionData, userId) {
    const {
      type,
      category,
      description,
      amount,
      date,
      client_id,
      quote_id,
      status = 'PENDING',
      payment_method,
      reference,
      notes
    } = transactionData;

    const id = EncryptionUtils.generateUUID();

    await this.db.run(`
      INSERT INTO transactions (
        id, type, category, description, amount, date,
        client_id, quote_id, status, payment_method,
        reference, notes, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [
      id, type, category, description, amount, date,
      client_id, quote_id, status, payment_method,
      reference, notes, userId
    ]);

    return await this.findById(id, userId);
  }

  async update(id, updateData, userId) {
    const fields = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && key !== 'id' && key !== 'created_by') {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });

    if (fields.length === 0) return null;

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id, userId);

    await this.db.run(
      `UPDATE transactions SET ${fields.join(', ')} WHERE id = ? AND created_by = ?`,
      values
    );

    return await this.findById(id, userId);
  }

  async updateStatus(id, status, userId) {
    await this.db.run(
      'UPDATE transactions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND created_by = ?',
      [status, id, userId]
    );

    return await this.findById(id, userId);
  }

  async delete(id, userId) {
    await this.db.run(
      'UPDATE transactions SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND created_by = ?',
      [id, userId]
    );
  }

  async list(filters = {}, userId) {
    const {
      page = 1,
      limit = 10,
      search,
      type,
      category,
      status,
      client_id,
      date_from,
      date_to,
      amount_min,
      amount_max,
      sort = 'date',
      order = 'DESC'
    } = filters;

    const offset = (page - 1) * limit;
    let whereConditions = ['t.created_by = ?', 't.deleted_at IS NULL'];
    let params = [userId];

    if (search) {
      whereConditions.push('(t.description LIKE ? OR t.reference LIKE ? OR c.name LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (type) {
      whereConditions.push('t.type = ?');
      params.push(type);
    }

    if (category) {
      whereConditions.push('t.category = ?');
      params.push(category);
    }

    if (status) {
      whereConditions.push('t.status = ?');
      params.push(status);
    }

    if (client_id) {
      whereConditions.push('t.client_id = ?');
      params.push(client_id);
    }

    if (date_from) {
      whereConditions.push('t.date >= ?');
      params.push(date_from);
    }

    if (date_to) {
      whereConditions.push('t.date <= ?');
      params.push(date_to);
    }

    if (amount_min) {
      whereConditions.push('t.amount >= ?');
      params.push(amount_min);
    }

    if (amount_max) {
      whereConditions.push('t.amount <= ?');
      params.push(amount_max);
    }

    const validSortFields = ['date', 'amount', 'type', 'status', 'created_at'];
    const sortField = validSortFields.includes(sort) ? sort : 'date';
    const sortOrder = ['ASC', 'DESC'].includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const transactions = await this.db.all(`
      SELECT 
        t.*,
        c.name as client_name,
        q.title as quote_title,
        u.name as created_by_name
      FROM transactions t
      LEFT JOIN clients c ON t.client_id = c.id
      LEFT JOIN quotes q ON t.quote_id = q.id
      LEFT JOIN users u ON t.created_by = u.id
      ${whereClause}
      ORDER BY t.${sortField} ${sortOrder}
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);

    // Calculate totals
    const totalsResult = await this.db.get(`
      SELECT 
        SUM(CASE WHEN t.type = 'INCOME' AND t.status = 'COMPLETED' THEN t.amount ELSE 0 END) as total_income,
        SUM(CASE WHEN t.type = 'EXPENSE' AND t.status = 'COMPLETED' THEN t.amount ELSE 0 END) as total_expense,
        COUNT(CASE WHEN t.type = 'INCOME' THEN 1 END) as income_count,
        COUNT(CASE WHEN t.type = 'EXPENSE' THEN 1 END) as expense_count
      FROM transactions t
      LEFT JOIN clients c ON t.client_id = c.id
      ${whereClause}
    `, params);

    const total = await this.db.get(`
      SELECT COUNT(*) as count
      FROM transactions t
      LEFT JOIN clients c ON t.client_id = c.id
      ${whereClause}
    `, params);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total: total.count,
        totalPages: Math.ceil(total.count / limit)
      },
      summary: {
        totalIncome: totalsResult.total_income || 0,
        totalExpense: totalsResult.total_expense || 0,
        balance: (totalsResult.total_income || 0) - (totalsResult.total_expense || 0),
        incomeCount: totalsResult.income_count || 0,
        expenseCount: totalsResult.expense_count || 0
      }
    };
  }

  async getStats(userId, period = 30) {
    const stats = await this.db.get(`
      SELECT
        COUNT(*) as total_transactions,
        SUM(CASE WHEN type = 'INCOME' AND status = 'COMPLETED' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'EXPENSE' AND status = 'COMPLETED' THEN amount ELSE 0 END) as total_expense,
        COUNT(CASE WHEN type = 'INCOME' THEN 1 END) as income_count,
        COUNT(CASE WHEN type = 'EXPENSE' THEN 1 END) as expense_count,
        COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_count,
        SUM(CASE WHEN status = 'PENDING' THEN amount ELSE 0 END) as pending_amount
      FROM transactions
      WHERE created_by = ? AND deleted_at IS NULL
      AND date >= date('now', '-${period} days')
    `, [userId]);

    const monthlyStats = await this.db.all(`
      SELECT
        strftime('%Y-%m', date) as month,
        SUM(CASE WHEN type = 'INCOME' AND status = 'COMPLETED' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'EXPENSE' AND status = 'COMPLETED' THEN amount ELSE 0 END) as expense,
        COUNT(*) as transaction_count
      FROM transactions
      WHERE created_by = ? AND deleted_at IS NULL
      AND date >= date('now', '-12 months')
      GROUP BY strftime('%Y-%m', date)
      ORDER BY month DESC
      LIMIT 12
    `, [userId]);

    const categoryStats = await this.db.all(`
      SELECT
        category,
        type,
        COUNT(*) as count,
        SUM(amount) as total_amount
      FROM transactions
      WHERE created_by = ? AND deleted_at IS NULL
      AND status = 'COMPLETED'
      AND date >= date('now', '-${period} days')
      GROUP BY category, type
      ORDER BY total_amount DESC
    `, [userId]);

    return {
      summary: {
        ...stats,
        balance: (stats.total_income || 0) - (stats.total_expense || 0),
        period_days: period
      },
      monthly: monthlyStats,
      categories: categoryStats
    };
  }

  async getCategories(userId, type = null) {
    let whereClause = 'WHERE created_by = ? AND category IS NOT NULL AND category != \'\' AND deleted_at IS NULL';
    let params = [userId];

    if (type) {
      whereClause += ' AND type = ?';
      params.push(type);
    }

    const categories = await this.db.all(`
      SELECT DISTINCT category, type
      FROM transactions
      ${whereClause}
      ORDER BY category
    `, params);

    return categories;
  }

  async getCashFlow(userId, startDate, endDate, groupBy = 'day') {
    let groupFormat;
    switch (groupBy) {
      case 'month':
        groupFormat = '%Y-%m';
        break;
      case 'week':
        groupFormat = '%Y-W%W';
        break;
      default:
        groupFormat = '%Y-%m-%d';
    }

    const cashFlow = await this.db.all(`
      SELECT
        strftime('${groupFormat}', date) as period,
        SUM(CASE WHEN type = 'INCOME' AND status = 'COMPLETED' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'EXPENSE' AND status = 'COMPLETED' THEN amount ELSE 0 END) as expense,
        COUNT(*) as transaction_count
      FROM transactions
      WHERE created_by = ? AND deleted_at IS NULL
      AND date >= ? AND date <= ?
      GROUP BY strftime('${groupFormat}', date)
      ORDER BY period ASC
    `, [userId, startDate, endDate]);

    // Calculate running balance
    let runningBalance = 0;
    const cashFlowWithBalance = cashFlow.map(item => {
      const netFlow = (item.income || 0) - (item.expense || 0);
      runningBalance += netFlow;
      
      return {
        ...item,
        net_flow: netFlow,
        running_balance: runningBalance
      };
    });

    return cashFlowWithBalance;
  }
}

module.exports = Transaction;