const { Database } = require('../config/database');
const EncryptionUtils = require('../utils/encryption');

class Client {
  constructor() {
    this.db = new Database();
  }

  async findById(id, userId) {
    return await this.db.get(
      'SELECT * FROM clients WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [id, userId]
    );
  }

  async findByDocument(document, userId) {
    return await this.db.get(
      'SELECT * FROM clients WHERE document = ? AND user_id = ? AND deleted_at IS NULL',
      [document, userId]
    );
  }

  async create(clientData, userId) {
    const {
      person_type = 'FISICA',
      name,
      trading_name,
      document,
      state_registration,
      municipal_registration,
      zip_code,
      street,
      number,
      complement,
      neighborhood,
      city,
      state,
      phone,
      mobile,
      email,
      contact_name,
      contact_role,
      category = 'REGULAR',
      notes,
      active = true
    } = clientData;

    const id = EncryptionUtils.generateUUID();

    const result = await this.db.run(`
      INSERT INTO clients (
        id, person_type, name, trading_name, document, state_registration,
        municipal_registration, zip_code, street, number, complement,
        neighborhood, city, state, phone, mobile, email, contact_name,
        contact_role, category, notes, active, user_id, 
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [
      id, person_type, name, trading_name, document, state_registration,
      municipal_registration, zip_code, street, number, complement,
      neighborhood, city, state, phone, mobile, email, contact_name,
      contact_role, category, notes, active, userId
    ]);

    return await this.findById(id, userId);
  }

  async update(id, updateData, userId) {
    const fields = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && key !== 'id' && key !== 'user_id') {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });

    if (fields.length === 0) return null;

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id, userId);

    await this.db.run(
      `UPDATE clients SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
      values
    );

    return await this.findById(id, userId);
  }

  async delete(id, userId) {
    await this.db.run(
      'UPDATE clients SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
      [id, userId]
    );
  }

  async list(filters = {}, userId) {
    const { page = 1, limit = 10, search, category, active } = filters;
    const offset = (page - 1) * limit;

    let whereConditions = ['user_id = ?', 'deleted_at IS NULL'];
    let params = [userId];

    if (search) {
      whereConditions.push('(name LIKE ? OR document LIKE ? OR email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (category) {
      whereConditions.push('category = ?');
      params.push(category);
    }

    if (active !== undefined) {
      whereConditions.push('active = ?');
      params.push(active);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const clients = await this.db.all(`
      SELECT * FROM clients
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);

    const total = await this.db.get(`
      SELECT COUNT(*) as count FROM clients ${whereClause}
    `, params);

    return {
      clients,
      pagination: {
        page,
        limit,
        total: total.count,
        totalPages: Math.ceil(total.count / limit)
      }
    };
  }

  async search(query, userId, limit = 10) {
    if (!query || query.length < 2) return [];

    return await this.db.all(`
      SELECT id, name, document, email, phone
      FROM clients
      WHERE user_id = ? AND deleted_at IS NULL
      AND (name LIKE ? OR document LIKE ? OR email LIKE ?)
      ORDER BY name ASC
      LIMIT ?
    `, [userId, `%${query}%`, `%${query}%`, `%${query}%`, parseInt(limit)]);
  }

  async getStats(userId) {
    const stats = await this.db.get(`
      SELECT
        COUNT(*) as total_clients,
        COUNT(CASE WHEN active = 1 THEN 1 END) as active_clients,
        COUNT(CASE WHEN person_type = 'FISICA' THEN 1 END) as individual_clients,
        COUNT(CASE WHEN person_type = 'JURIDICA' THEN 1 END) as business_clients
      FROM clients
      WHERE user_id = ? AND deleted_at IS NULL
    `, [userId]);

    const categoriesStats = await this.db.all(`
      SELECT
        category,
        COUNT(*) as count
      FROM clients
      WHERE user_id = ? AND deleted_at IS NULL
      GROUP BY category
      ORDER BY count DESC
    `, [userId]);

    return {
      ...stats,
      categories: categoriesStats
    };
  }

  async getCategories(userId) {
    const categories = await this.db.all(`
      SELECT DISTINCT category
      FROM clients
      WHERE user_id = ? AND category IS NOT NULL AND category != '' AND deleted_at IS NULL
      ORDER BY category
    `, [userId]);

    return categories.map(cat => cat.category);
  }
}

module.exports = Client;