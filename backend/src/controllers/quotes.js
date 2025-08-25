const database = require('../config/database');
const auditService = require('../services/audit.service');
const { quoteSchema, quoteUpdateSchema, quoteSearchSchema, quoteItemSchema } = require('../utils/validation');
const { AppError } = require('../utils/errors');
const crypto = require('crypto');

class QuotesController {

  // Criar orçamento
  async create(req, res) {
    try {
      const validatedData = quoteSchema.parse(req.body);
      const userId = req.user.id;

      const quoteData = {
        ...validatedData,
        public_id: crypto.randomUUID(),
        created_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      let quoteId;
      
      // Transação para criar orçamento e itens
      await database.transaction(async (db) => {
        const result = await db.run(`
          INSERT INTO quotes (
            client_id, public_id, title, description, valid_until,
            status, subtotal, discount_amount, discount_percentage,
            total, notes, created_by, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          quoteData.client_id,
          quoteData.public_id,
          quoteData.title,
          quoteData.description || null,
          quoteData.valid_until || null,
          quoteData.status || 'DRAFT',
          quoteData.subtotal || 0,
          quoteData.discount_amount || 0,
          quoteData.discount_percentage || 0,
          quoteData.total || 0,
          quoteData.notes || null,
          quoteData.created_by,
          quoteData.created_at,
          quoteData.updated_at
        ]);

        quoteId = result.lastID;

        // Adicionar itens se fornecidos
        if (quoteData.items && quoteData.items.length > 0) {
          for (const item of quoteData.items) {
            await db.run(`
              INSERT INTO quote_items (
                quote_id, product_id, service_id, description,
                quantity, unit_price, total
              ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
              quoteId,
              item.product_id || null,
              item.service_id || null,
              item.description,
              item.quantity,
              item.unit_price,
              item.total
            ]);
          }

          // Recalcular totais
          await this.recalculateTotals(db, quoteId);
        }
      });

      const quote = await this.getQuoteWithItems(quoteId);

      await auditService.log({
        user_id: userId,
        action: 'CREATE',
        table_name: 'quotes',
        record_id: quoteId,
        new_values: quote,
        ip: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.status(201).json({
        success: true,
        data: quote,
        message: 'Orçamento criado com sucesso'
      });
    } catch (error) {
      console.error('Error creating quote:', error);
      
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

  // Listar orçamentos com paginação e filtros
  async list(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        client_id,
        status,
        valid_from,
        valid_to,
        sort = 'created_at',
        order = 'DESC'
      } = quoteSearchSchema.parse(req.query);

      const offset = (page - 1) * limit;
      let whereConditions = ['q.active = 1'];
      let params = [];

      // Filtro por busca
      if (search) {
        whereConditions.push('(q.title LIKE ? OR q.description LIKE ? OR c.name LIKE ?)');
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      // Filtro por cliente
      if (client_id) {
        whereConditions.push('q.client_id = ?');
        params.push(client_id);
      }

      // Filtro por status
      if (status) {
        whereConditions.push('q.status = ?');
        params.push(status);
      }

      // Filtro por data de validade
      if (valid_from) {
        whereConditions.push('q.valid_until >= ?');
        params.push(valid_from);
      }

      if (valid_to) {
        whereConditions.push('q.valid_until <= ?');
        params.push(valid_to);
      }

      const whereClause = whereConditions.join(' AND ');
      
      // Validar campos de ordenação
      const validSortFields = ['title', 'status', 'total', 'valid_until', 'created_at'];
      const validOrders = ['ASC', 'DESC'];
      
      const sortField = validSortFields.includes(sort) ? sort : 'created_at';
      const sortOrder = validOrders.includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';

      // Buscar orçamentos
      const quotes = await database.all(`
        SELECT 
          q.*,
          c.name as client_name,
          c.email as client_email,
          u.name as created_by_name
        FROM quotes q
        LEFT JOIN clients c ON q.client_id = c.id
        LEFT JOIN users u ON q.created_by = u.id
        WHERE ${whereClause}
        ORDER BY q.${sortField} ${sortOrder}
        LIMIT ? OFFSET ?
      `, [...params, limit, offset]);

      // Contar total
      const totalResult = await database.get(`
        SELECT COUNT(*) as total
        FROM quotes q
        LEFT JOIN clients c ON q.client_id = c.id
        WHERE ${whereClause}
      `, params);

      const total = totalResult.total;
      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: {
          quotes,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }
      });
    } catch (error) {
      console.error('Error listing quotes:', error);
      
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

  // Buscar orçamento por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const quote = await this.getQuoteWithItems(id);

      if (!quote) {
        return res.status(404).json({
          success: false,
          error: { message: 'Orçamento não encontrado' }
        });
      }

      res.json({
        success: true,
        data: quote
      });
    } catch (error) {
      console.error('Error getting quote:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor' }
      });
    }
  }

  // Buscar orçamento por public_id (link público)
  async getByPublicId(req, res) {
    try {
      const { public_id } = req.params;
      
      const quote = await database.get(`
        SELECT 
          q.*,
          c.name as client_name,
          c.email as client_email,
          c.phone as client_phone
        FROM quotes q
        LEFT JOIN clients c ON q.client_id = c.id
        WHERE q.public_id = ? AND q.active = 1
      `, [public_id]);

      if (!quote) {
        return res.status(404).json({
          success: false,
          error: { message: 'Orçamento não encontrado' }
        });
      }

      // Buscar itens
      const items = await database.all(`
        SELECT 
          qi.*,
          p.name as product_name,
          s.name as service_name
        FROM quote_items qi
        LEFT JOIN products p ON qi.product_id = p.id
        LEFT JOIN services s ON qi.service_id = s.id
        WHERE qi.quote_id = ?
        ORDER BY qi.id
      `, [quote.id]);

      quote.items = items;

      res.json({
        success: true,
        data: quote
      });
    } catch (error) {
      console.error('Error getting quote by public_id:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor' }
      });
    }
  }

  // Atualizar orçamento
  async update(req, res) {
    try {
      const { id } = req.params;
      const validatedData = quoteUpdateSchema.parse(req.body);
      const userId = req.user.id;

      // Verificar se orçamento existe
      const existingQuote = await database.get(
        'SELECT * FROM quotes WHERE id = ? AND active = 1',
        [id]
      );

      if (!existingQuote) {
        return res.status(404).json({
          success: false,
          error: { message: 'Orçamento não encontrado' }
        });
      }

      await database.transaction(async (db) => {
        // Atualizar orçamento
        const updates = [];
        const params = [];

        Object.keys(validatedData).forEach(key => {
          if (key !== 'items' && validatedData[key] !== undefined) {
            updates.push(`${key} = ?`);
            params.push(validatedData[key]);
          }
        });

        if (updates.length > 0) {
          updates.push('updated_at = ?');
          params.push(new Date().toISOString());
          params.push(id);

          await db.run(`
            UPDATE quotes
            SET ${updates.join(', ')}
            WHERE id = ?
          `, params);
        }

        // Atualizar itens se fornecidos
        if (validatedData.items) {
          // Remover itens existentes
          await db.run('DELETE FROM quote_items WHERE quote_id = ?', [id]);

          // Adicionar novos itens
          for (const item of validatedData.items) {
            await db.run(`
              INSERT INTO quote_items (
                quote_id, product_id, service_id, description,
                quantity, unit_price, total
              ) VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
              id,
              item.product_id || null,
              item.service_id || null,
              item.description,
              item.quantity,
              item.unit_price,
              item.total
            ]);
          }

          // Recalcular totais
          await this.recalculateTotals(db, id);
        }
      });

      const updatedQuote = await this.getQuoteWithItems(id);

      await auditService.log({
        user_id: userId,
        action: 'UPDATE',
        table_name: 'quotes',
        record_id: parseInt(id),
        old_values: existingQuote,
        new_values: updatedQuote,
        ip: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.json({
        success: true,
        data: updatedQuote,
        message: 'Orçamento atualizado com sucesso'
      });
    } catch (error) {
      console.error('Error updating quote:', error);
      
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

  // Atualizar status do orçamento
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.user.id;

      if (!['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: { message: 'Status inválido' }
        });
      }

      const existingQuote = await database.get(
        'SELECT * FROM quotes WHERE id = ? AND active = 1',
        [id]
      );

      if (!existingQuote) {
        return res.status(404).json({
          success: false,
          error: { message: 'Orçamento não encontrado' }
        });
      }

      await database.run(
        'UPDATE quotes SET status = ?, updated_at = ? WHERE id = ?',
        [status, new Date().toISOString(), id]
      );

      const updatedQuote = await this.getQuoteWithItems(id);

      await auditService.log({
        user_id: userId,
        action: 'STATUS_UPDATE',
        table_name: 'quotes',
        record_id: parseInt(id),
        old_values: { status: existingQuote.status },
        new_values: { status },
        ip: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.json({
        success: true,
        data: updatedQuote,
        message: 'Status do orçamento atualizado com sucesso'
      });
    } catch (error) {
      console.error('Error updating quote status:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor' }
      });
    }
  }

  // Deletar orçamento (soft delete)
  async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const quote = await database.get(
        'SELECT * FROM quotes WHERE id = ? AND active = 1',
        [id]
      );

      if (!quote) {
        return res.status(404).json({
          success: false,
          error: { message: 'Orçamento não encontrado' }
        });
      }

      await database.run(
        'UPDATE quotes SET active = 0 WHERE id = ?',
        [id]
      );

      await auditService.log({
        user_id: userId,
        action: 'DELETE',
        table_name: 'quotes',
        record_id: parseInt(id),
        old_values: quote,
        ip: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Orçamento deletado com sucesso'
      });
    } catch (error) {
      console.error('Error deleting quote:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor' }
      });
    }
  }

  // Duplicar orçamento
  async duplicate(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const originalQuote = await this.getQuoteWithItems(id);
      
      if (!originalQuote) {
        return res.status(404).json({
          success: false,
          error: { message: 'Orçamento não encontrado' }
        });
      }

      let newQuoteId;
      
      await database.transaction(async (db) => {
        // Criar novo orçamento
        const result = await db.run(`
          INSERT INTO quotes (
            client_id, public_id, title, description, valid_until,
            status, subtotal, discount_amount, discount_percentage,
            total, notes, created_by, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          originalQuote.client_id,
          crypto.randomUUID(),
          `${originalQuote.title} (Cópia)`,
          originalQuote.description,
          null, // Reset valid_until
          'DRAFT', // Reset status
          originalQuote.subtotal,
          originalQuote.discount_amount,
          originalQuote.discount_percentage,
          originalQuote.total,
          originalQuote.notes,
          userId,
          new Date().toISOString(),
          new Date().toISOString()
        ]);

        newQuoteId = result.lastID;

        // Duplicar itens
        for (const item of originalQuote.items || []) {
          await db.run(`
            INSERT INTO quote_items (
              quote_id, product_id, service_id, description,
              quantity, unit_price, total
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [
            newQuoteId,
            item.product_id,
            item.service_id,
            item.description,
            item.quantity,
            item.unit_price,
            item.total
          ]);
        }
      });

      const newQuote = await this.getQuoteWithItems(newQuoteId);

      await auditService.log({
        user_id: userId,
        action: 'DUPLICATE',
        table_name: 'quotes',
        record_id: newQuoteId,
        new_values: { duplicated_from: parseInt(id) },
        ip: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.status(201).json({
        success: true,
        data: newQuote,
        message: 'Orçamento duplicado com sucesso'
      });
    } catch (error) {
      console.error('Error duplicating quote:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor' }
      });
    }
  }

  // Estatísticas de orçamentos
  async getStats(req, res) {
    try {
      const stats = await database.get(`
        SELECT
          COUNT(*) as total_quotes,
          COUNT(CASE WHEN status = 'DRAFT' THEN 1 END) as draft_quotes,
          COUNT(CASE WHEN status = 'SENT' THEN 1 END) as sent_quotes,
          COUNT(CASE WHEN status = 'ACCEPTED' THEN 1 END) as accepted_quotes,
          COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) as rejected_quotes,
          AVG(total) as average_value,
          SUM(CASE WHEN status = 'ACCEPTED' THEN total ELSE 0 END) as accepted_value
        FROM quotes
        WHERE active = 1
      `);

      const monthlyStats = await database.all(`
        SELECT
          strftime('%Y-%m', created_at) as month,
          COUNT(*) as count,
          SUM(total) as total_value
        FROM quotes
        WHERE active = 1
        GROUP BY strftime('%Y-%m', created_at)
        ORDER BY month DESC
        LIMIT 12
      `);

      res.json({
        success: true,
        data: {
          ...stats,
          monthly: monthlyStats
        }
      });
    } catch (error) {
      console.error('Error getting quote stats:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor' }
      });
    }
  }

  // Método auxiliar para buscar orçamento com itens
  async getQuoteWithItems(quoteId) {
    const quote = await database.get(`
      SELECT 
        q.*,
        c.name as client_name,
        c.email as client_email,
        c.phone as client_phone,
        u.name as created_by_name
      FROM quotes q
      LEFT JOIN clients c ON q.client_id = c.id
      LEFT JOIN users u ON q.created_by = u.id
      WHERE q.id = ? AND q.active = 1
    `, [quoteId]);

    if (quote) {
      const items = await database.all(`
        SELECT 
          qi.*,
          p.name as product_name,
          s.name as service_name
        FROM quote_items qi
        LEFT JOIN products p ON qi.product_id = p.id
        LEFT JOIN services s ON qi.service_id = s.id
        WHERE qi.quote_id = ?
        ORDER BY qi.id
      `, [quoteId]);

      quote.items = items;
    }

    return quote;
  }

  // Método auxiliar para recalcular totais
  async recalculateTotals(db, quoteId) {
    const result = await db.get(
      'SELECT SUM(total) as subtotal FROM quote_items WHERE quote_id = ?',
      [quoteId]
    );

    const subtotal = result.subtotal || 0;
    
    const quote = await db.get(
      'SELECT discount_amount, discount_percentage FROM quotes WHERE id = ?',
      [quoteId]
    );

    let total = subtotal;
    
    if (quote.discount_percentage > 0) {
      total = subtotal - (subtotal * quote.discount_percentage / 100);
    } else if (quote.discount_amount > 0) {
      total = subtotal - quote.discount_amount;
    }

    await db.run(
      'UPDATE quotes SET subtotal = ?, total = ? WHERE id = ?',
      [subtotal, Math.max(0, total), quoteId]
    );
  }
}

module.exports = new QuotesController();