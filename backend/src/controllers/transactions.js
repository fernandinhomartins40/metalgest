const database = require('../config/database');
const auditService = require('../services/audit.service');
const { transactionSchema, transactionUpdateSchema, transactionSearchSchema } = require('../utils/validation');
const { AppError } = require('../utils/errors');

class TransactionsController {

  // Criar transação
  async create(req, res) {
    try {
      const validatedData = transactionSchema.parse(req.body);
      const userId = req.user.id;

      const transactionData = {
        ...validatedData,
        created_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const result = await database.run(`
        INSERT INTO transactions (
          type, category, description, amount, date,
          client_id, quote_id, status, payment_method,
          reference, notes, created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        transactionData.type,
        transactionData.category || null,
        transactionData.description,
        transactionData.amount,
        transactionData.date,
        transactionData.client_id || null,
        transactionData.quote_id || null,
        transactionData.status || 'PENDING',
        transactionData.payment_method || null,
        transactionData.reference || null,
        transactionData.notes || null,
        transactionData.created_by,
        transactionData.created_at,
        transactionData.updated_at
      ]);

      const transaction = await database.get(`
        SELECT 
          t.*,
          c.name as client_name,
          q.title as quote_title
        FROM transactions t
        LEFT JOIN clients c ON t.client_id = c.id
        LEFT JOIN quotes q ON t.quote_id = q.id
        WHERE t.id = ?
      `, [result.lastID]);

      await auditService.log({
        user_id: userId,
        action: 'CREATE',
        table_name: 'transactions',
        record_id: result.lastID,
        new_values: transaction,
        ip: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.status(201).json({
        success: true,
        data: transaction,
        message: 'Transação criada com sucesso'
      });
    } catch (error) {
      console.error('Error creating transaction:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Dados inválidos',
            details: error.errors
          }
        });
      }
      
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          error: { message: error.message }
        });
      }
      
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor' }
      });
    }
  }

  // Listar transações com paginação e filtros
  async list(req, res) {
    try {
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
      } = transactionSearchSchema.parse(req.query);

      const offset = (page - 1) * limit;
      let whereConditions = ['t.active = 1'];
      let params = [];

      // Filtro por busca
      if (search) {
        whereConditions.push('(t.description LIKE ? OR t.reference LIKE ? OR c.name LIKE ?)');
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      // Filtro por tipo
      if (type) {
        whereConditions.push('t.type = ?');
        params.push(type);
      }

      // Filtro por categoria
      if (category) {
        whereConditions.push('t.category = ?');
        params.push(category);
      }

      // Filtro por status
      if (status) {
        whereConditions.push('t.status = ?');
        params.push(status);
      }

      // Filtro por cliente
      if (client_id) {
        whereConditions.push('t.client_id = ?');
        params.push(client_id);
      }

      // Filtro por data
      if (date_from) {
        whereConditions.push('t.date >= ?');
        params.push(date_from);
      }

      if (date_to) {
        whereConditions.push('t.date <= ?');
        params.push(date_to);
      }

      // Filtro por valor
      if (amount_min) {
        whereConditions.push('t.amount >= ?');
        params.push(amount_min);
      }

      if (amount_max) {
        whereConditions.push('t.amount <= ?');
        params.push(amount_max);
      }

      const whereClause = whereConditions.join(' AND ');
      
      // Validar campos de ordenação
      const validSortFields = ['date', 'amount', 'type', 'status', 'created_at'];
      const validOrders = ['ASC', 'DESC'];
      
      const sortField = validSortFields.includes(sort) ? sort : 'date';
      const sortOrder = validOrders.includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';

      // Buscar transações
      const transactions = await database.all(`
        SELECT 
          t.*,
          c.name as client_name,
          q.title as quote_title,
          u.name as created_by_name
        FROM transactions t
        LEFT JOIN clients c ON t.client_id = c.id
        LEFT JOIN quotes q ON t.quote_id = q.id
        LEFT JOIN users u ON t.created_by = u.id
        WHERE ${whereClause}
        ORDER BY t.${sortField} ${sortOrder}
        LIMIT ? OFFSET ?
      `, [...params, limit, offset]);

      // Contar total
      const totalResult = await database.get(`
        SELECT COUNT(*) as total
        FROM transactions t
        LEFT JOIN clients c ON t.client_id = c.id
        WHERE ${whereClause}
      `, params);

      // Calcular totais por tipo
      const totalsResult = await database.get(`
        SELECT 
          SUM(CASE WHEN t.type = 'INCOME' AND t.status = 'COMPLETED' THEN t.amount ELSE 0 END) as total_income,
          SUM(CASE WHEN t.type = 'EXPENSE' AND t.status = 'COMPLETED' THEN t.amount ELSE 0 END) as total_expense,
          COUNT(CASE WHEN t.type = 'INCOME' THEN 1 END) as income_count,
          COUNT(CASE WHEN t.type = 'EXPENSE' THEN 1 END) as expense_count
        FROM transactions t
        LEFT JOIN clients c ON t.client_id = c.id
        WHERE ${whereClause}
      `, params);

      const total = totalResult.total;
      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: {
          transactions,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
          },
          summary: {
            totalIncome: totalsResult.total_income || 0,
            totalExpense: totalsResult.total_expense || 0,
            balance: (totalsResult.total_income || 0) - (totalsResult.total_expense || 0),
            incomeCount: totalsResult.income_count || 0,
            expenseCount: totalsResult.expense_count || 0
          }
        }
      });
    } catch (error) {
      console.error('Error listing transactions:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Parâmetros inválidos',
            details: error.errors
          }
        });
      }
      
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor' }
      });
    }
  }

  // Buscar transação por ID
  async getById(req, res) {
    try {
      const { id } = req.params;

      const transaction = await database.get(`
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
        WHERE t.id = ? AND t.active = 1
      `, [id]);

      if (!transaction) {
        return res.status(404).json({
          success: false,
          error: { message: 'Transação não encontrada' }
        });
      }

      res.json({
        success: true,
        data: transaction
      });
    } catch (error) {
      console.error('Error getting transaction:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor' }
      });
    }
  }

  // Atualizar transação
  async update(req, res) {
    try {
      const { id } = req.params;
      const validatedData = transactionUpdateSchema.parse(req.body);
      const userId = req.user.id;

      // Verificar se transação existe
      const existingTransaction = await database.get(
        'SELECT * FROM transactions WHERE id = ? AND active = 1',
        [id]
      );

      if (!existingTransaction) {
        return res.status(404).json({
          success: false,
          error: { message: 'Transação não encontrada' }
        });
      }

      const updates = [];
      const params = [];

      Object.keys(validatedData).forEach(key => {
        if (validatedData[key] !== undefined) {
          updates.push(`${key} = ?`);
          params.push(validatedData[key]);
        }
      });

      updates.push('updated_at = ?');
      params.push(new Date().toISOString());
      params.push(id);

      await database.run(`
        UPDATE transactions
        SET ${updates.join(', ')}
        WHERE id = ?
      `, params);

      const updatedTransaction = await database.get(`
        SELECT 
          t.*,
          c.name as client_name,
          q.title as quote_title
        FROM transactions t
        LEFT JOIN clients c ON t.client_id = c.id
        LEFT JOIN quotes q ON t.quote_id = q.id
        WHERE t.id = ?
      `, [id]);

      await auditService.log({
        user_id: userId,
        action: 'UPDATE',
        table_name: 'transactions',
        record_id: parseInt(id),
        old_values: existingTransaction,
        new_values: updatedTransaction,
        ip: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.json({
        success: true,
        data: updatedTransaction,
        message: 'Transação atualizada com sucesso'
      });
    } catch (error) {
      console.error('Error updating transaction:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Dados inválidos',
            details: error.errors
          }
        });
      }
      
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor' }
      });
    }
  }

  // Atualizar status da transação
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user.id;

      if (!['PENDING', 'COMPLETED', 'CANCELLED'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: { message: 'Status inválido' }
        });
      }

      const existingTransaction = await database.get(
        'SELECT * FROM transactions WHERE id = ? AND active = 1',
        [id]
      );

      if (!existingTransaction) {
        return res.status(404).json({
          success: false,
          error: { message: 'Transação não encontrada' }
        });
      }

      await database.run(
        'UPDATE transactions SET status = ?, updated_at = ? WHERE id = ?',
        [status, new Date().toISOString(), id]
      );

      const updatedTransaction = await database.get(`
        SELECT 
          t.*,
          c.name as client_name,
          q.title as quote_title
        FROM transactions t
        LEFT JOIN clients c ON t.client_id = c.id
        LEFT JOIN quotes q ON t.quote_id = q.id
        WHERE t.id = ?
      `, [id]);

      await auditService.log({
        user_id: userId,
        action: 'STATUS_UPDATE',
        table_name: 'transactions',
        record_id: parseInt(id),
        old_values: { status: existingTransaction.status },
        new_values: { status },
        ip: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.json({
        success: true,
        data: updatedTransaction,
        message: 'Status da transação atualizado com sucesso'
      });
    } catch (error) {
      console.error('Error updating transaction status:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor' }
      });
    }
  }

  // Deletar transação (soft delete)
  async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const transaction = await database.get(
        'SELECT * FROM transactions WHERE id = ? AND active = 1',
        [id]
      );

      if (!transaction) {
        return res.status(404).json({
          success: false,
          error: { message: 'Transação não encontrada' }
        });
      }

      await database.run(
        'UPDATE transactions SET active = 0 WHERE id = ?',
        [id]
      );

      await auditService.log({
        user_id: userId,
        action: 'DELETE',
        table_name: 'transactions',
        record_id: parseInt(id),
        old_values: transaction,
        ip: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Transação deletada com sucesso'
      });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor' }
      });
    }
  }

  // Estatísticas financeiras
  async getStats(req, res) {
    try {
      const { period = '30' } = req.query;
      const days = parseInt(period);

      const stats = await database.get(`
        SELECT
          COUNT(*) as total_transactions,
          SUM(CASE WHEN type = 'INCOME' AND status = 'COMPLETED' THEN amount ELSE 0 END) as total_income,
          SUM(CASE WHEN type = 'EXPENSE' AND status = 'COMPLETED' THEN amount ELSE 0 END) as total_expense,
          COUNT(CASE WHEN type = 'INCOME' THEN 1 END) as income_count,
          COUNT(CASE WHEN type = 'EXPENSE' THEN 1 END) as expense_count,
          COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_count,
          SUM(CASE WHEN status = 'PENDING' THEN amount ELSE 0 END) as pending_amount
        FROM transactions
        WHERE active = 1
        AND date >= date('now', '-${days} days')
      `);

      const monthlyStats = await database.all(`
        SELECT
          strftime('%Y-%m', date) as month,
          SUM(CASE WHEN type = 'INCOME' AND status = 'COMPLETED' THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN type = 'EXPENSE' AND status = 'COMPLETED' THEN amount ELSE 0 END) as expense,
          COUNT(*) as transaction_count
        FROM transactions
        WHERE active = 1
        AND date >= date('now', '-12 months')
        GROUP BY strftime('%Y-%m', date)
        ORDER BY month DESC
        LIMIT 12
      `);

      const categoryStats = await database.all(`
        SELECT
          category,
          type,
          COUNT(*) as count,
          SUM(amount) as total_amount
        FROM transactions
        WHERE active = 1
        AND status = 'COMPLETED'
        AND date >= date('now', '-${days} days')
        GROUP BY category, type
        ORDER BY total_amount DESC
      `);

      const balance = (stats.total_income || 0) - (stats.total_expense || 0);

      res.json({
        success: true,
        data: {
          summary: {
            ...stats,
            balance,
            period_days: days
          },
          monthly: monthlyStats,
          categories: categoryStats
        }
      });
    } catch (error) {
      console.error('Error getting transaction stats:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor' }
      });
    }
  }

  // Buscar categorias
  async getCategories(req, res) {
    try {
      const { type } = req.query;
      
      let whereClause = 'WHERE category IS NOT NULL AND category != \'\' AND active = 1';
      let params = [];

      if (type) {
        whereClause += ' AND type = ?';
        params.push(type);
      }

      const categories = await database.all(`
        SELECT DISTINCT category, type
        FROM transactions
        ${whereClause}
        ORDER BY category
      `, params);

      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Error getting categories:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor' }
      });
    }
  }

  // Relatório de fluxo de caixa
  async getCashFlow(req, res) {
    try {
      const { start_date, end_date, group_by = 'day' } = req.query;
      
      if (!start_date || !end_date) {
        return res.status(400).json({
          success: false,
          error: { message: 'Parâmetros start_date e end_date são obrigatórios' }
        });
      }

      let groupFormat;
      switch (group_by) {
        case 'month':
          groupFormat = '%Y-%m';
          break;
        case 'week':
          groupFormat = '%Y-W%W';
          break;
        default:
          groupFormat = '%Y-%m-%d';
      }

      const cashFlow = await database.all(`
        SELECT
          strftime('${groupFormat}', date) as period,
          SUM(CASE WHEN type = 'INCOME' AND status = 'COMPLETED' THEN amount ELSE 0 END) as income,
          SUM(CASE WHEN type = 'EXPENSE' AND status = 'COMPLETED' THEN amount ELSE 0 END) as expense,
          COUNT(*) as transaction_count
        FROM transactions
        WHERE active = 1
        AND date >= ?
        AND date <= ?
        GROUP BY strftime('${groupFormat}', date)
        ORDER BY period ASC
      `, [start_date, end_date]);

      // Calcular saldo acumulado
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

      res.json({
        success: true,
        data: cashFlowWithBalance
      });
    } catch (error) {
      console.error('Error getting cash flow:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor' }
      });
    }
  }
}

module.exports = new TransactionsController();