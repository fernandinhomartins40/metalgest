const { Database } = require('../config/database');
const EncryptionUtils = require('../utils/encryption');

class Quote {
  constructor() {
    this.db = new Database();
  }

  async findById(id, userId) {
    const quote = await this.db.get(`
      SELECT 
        q.*,
        c.name as client_name,
        c.email as client_email,
        c.phone as client_phone,
        u.name as created_by_name
      FROM quotes q
      LEFT JOIN clients c ON q.client_id = c.id
      LEFT JOIN users u ON q.created_by = u.id
      WHERE q.id = ? AND q.created_by = ? AND q.deleted_at IS NULL
    `, [id, userId]);

    if (quote) {
      quote.items = await this.getQuoteItems(id);
    }

    return quote;
  }

  async findByPublicId(publicId) {
    const quote = await this.db.get(`
      SELECT 
        q.*,
        c.name as client_name,
        c.email as client_email,
        c.phone as client_phone
      FROM quotes q
      LEFT JOIN clients c ON q.client_id = c.id
      WHERE q.public_id = ? AND q.deleted_at IS NULL
    `, [publicId]);

    if (quote) {
      quote.items = await this.getQuoteItems(quote.id);
    }

    return quote;
  }

  async getQuoteItems(quoteId) {
    return await this.db.all(`
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
  }

  async create(quoteData, userId) {
    const {
      client_id,
      title,
      description,
      valid_until,
      status = 'DRAFT',
      subtotal = 0,
      discount_amount = 0,
      discount_percentage = 0,
      total = 0,
      notes,
      items = []
    } = quoteData;

    const id = EncryptionUtils.generateUUID();
    const public_id = EncryptionUtils.generateUUID();

    await this.db.transaction(async (db) => {
      await db.run(`
        INSERT INTO quotes (
          id, client_id, public_id, title, description, valid_until,
          status, subtotal, discount_amount, discount_percentage,
          total, notes, created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [
        id, client_id, public_id, title, description, valid_until,
        status, subtotal, discount_amount, discount_percentage,
        total, notes, userId
      ]);

      // Add items if provided
      if (items.length > 0) {
        for (const item of items) {
          await db.run(`
            INSERT INTO quote_items (
              id, quote_id, product_id, service_id, description,
              quantity, unit_price, total
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            EncryptionUtils.generateUUID(),
            id,
            item.product_id || null,
            item.service_id || null,
            item.description,
            item.quantity,
            item.unit_price,
            item.total
          ]);
        }

        // Recalculate totals
        await this.recalculateTotals(db, id);
      }
    });

    return await this.findById(id, userId);
  }

  async update(id, updateData, userId) {
    const existingQuote = await this.findById(id, userId);
    if (!existingQuote) return null;

    await this.db.transaction(async (db) => {
      // Update quote
      const fields = [];
      const values = [];

      Object.keys(updateData).forEach(key => {
        if (key !== 'items' && updateData[key] !== undefined && key !== 'id' && key !== 'created_by') {
          fields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      });

      if (fields.length > 0) {
        fields.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        await db.run(
          `UPDATE quotes SET ${fields.join(', ')} WHERE id = ?`,
          values
        );
      }

      // Update items if provided
      if (updateData.items) {
        // Remove existing items
        await db.run('DELETE FROM quote_items WHERE quote_id = ?', [id]);

        // Add new items
        for (const item of updateData.items) {
          await db.run(`
            INSERT INTO quote_items (
              id, quote_id, product_id, service_id, description,
              quantity, unit_price, total
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            EncryptionUtils.generateUUID(),
            id,
            item.product_id || null,
            item.service_id || null,
            item.description,
            item.quantity,
            item.unit_price,
            item.total
          ]);
        }

        // Recalculate totals
        await this.recalculateTotals(db, id);
      }
    });

    return await this.findById(id, userId);
  }

  async updateStatus(id, status, userId) {
    await this.db.run(
      'UPDATE quotes SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND created_by = ?',
      [status, id, userId]
    );

    return await this.findById(id, userId);
  }

  async delete(id, userId) {
    await this.db.run(
      'UPDATE quotes SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND created_by = ?',
      [id, userId]
    );
  }

  async list(filters = {}, userId) {
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
    } = filters;

    const offset = (page - 1) * limit;
    let whereConditions = ['q.created_by = ?', 'q.deleted_at IS NULL'];
    let params = [userId];

    if (search) {
      whereConditions.push('(q.title LIKE ? OR q.description LIKE ? OR c.name LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (client_id) {
      whereConditions.push('q.client_id = ?');
      params.push(client_id);
    }

    if (status) {
      whereConditions.push('q.status = ?');
      params.push(status);
    }

    if (valid_from) {
      whereConditions.push('q.valid_until >= ?');
      params.push(valid_from);
    }

    if (valid_to) {
      whereConditions.push('q.valid_until <= ?');
      params.push(valid_to);
    }

    const validSortFields = ['title', 'status', 'total', 'valid_until', 'created_at'];
    const sortField = validSortFields.includes(sort) ? sort : 'created_at';
    const sortOrder = ['ASC', 'DESC'].includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const quotes = await this.db.all(`
      SELECT 
        q.*,
        c.name as client_name,
        c.email as client_email,
        u.name as created_by_name
      FROM quotes q
      LEFT JOIN clients c ON q.client_id = c.id
      LEFT JOIN users u ON q.created_by = u.id
      ${whereClause}
      ORDER BY q.${sortField} ${sortOrder}
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);

    const total = await this.db.get(`
      SELECT COUNT(*) as count
      FROM quotes q
      LEFT JOIN clients c ON q.client_id = c.id
      ${whereClause}
    `, params);

    return {
      quotes,
      pagination: {
        page,
        limit,
        total: total.count,
        totalPages: Math.ceil(total.count / limit)
      }
    };
  }

  async duplicate(id, userId) {
    const originalQuote = await this.findById(id, userId);
    if (!originalQuote) return null;

    const newId = EncryptionUtils.generateUUID();
    const newPublicId = EncryptionUtils.generateUUID();

    await this.db.transaction(async (db) => {
      // Create new quote
      await db.run(`
        INSERT INTO quotes (
          id, client_id, public_id, title, description, valid_until,
          status, subtotal, discount_amount, discount_percentage,
          total, notes, created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [
        newId,
        originalQuote.client_id,
        newPublicId,
        `${originalQuote.title} (Cópia)`,
        originalQuote.description,
        null, // Reset valid_until
        'DRAFT', // Reset status
        originalQuote.subtotal,
        originalQuote.discount_amount,
        originalQuote.discount_percentage,
        originalQuote.total,
        originalQuote.notes,
        userId
      ]);

      // Duplicate items
      for (const item of originalQuote.items || []) {
        await db.run(`
          INSERT INTO quote_items (
            id, quote_id, product_id, service_id, description,
            quantity, unit_price, total
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          EncryptionUtils.generateUUID(),
          newId,
          item.product_id,
          item.service_id,
          item.description,
          item.quantity,
          item.unit_price,
          item.total
        ]);
      }
    });

    return await this.findById(newId, userId);
  }

  async getStats(userId) {
    const stats = await this.db.get(`
      SELECT
        COUNT(*) as total_quotes,
        COUNT(CASE WHEN status = 'DRAFT' THEN 1 END) as draft_quotes,
        COUNT(CASE WHEN status = 'SENT' THEN 1 END) as sent_quotes,
        COUNT(CASE WHEN status = 'ACCEPTED' THEN 1 END) as accepted_quotes,
        COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) as rejected_quotes,
        AVG(total) as average_value,
        SUM(CASE WHEN status = 'ACCEPTED' THEN total ELSE 0 END) as accepted_value
      FROM quotes
      WHERE created_by = ? AND deleted_at IS NULL
    `, [userId]);

    const monthlyStats = await this.db.all(`
      SELECT
        strftime('%Y-%m', created_at) as month,
        COUNT(*) as count,
        SUM(total) as total_value
      FROM quotes
      WHERE created_by = ? AND deleted_at IS NULL
      GROUP BY strftime('%Y-%m', created_at)
      ORDER BY month DESC
      LIMIT 12
    `, [userId]);

    return {
      ...stats,
      monthly: monthlyStats
    };
  }

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

module.exports = Quote;