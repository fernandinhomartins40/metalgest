const { Database } = require('../config/database');
const EncryptionUtils = require('../utils/encryption');

class Service {
  constructor() {
    this.db = new Database();
  }

  async findById(id, userId) {
    return await this.db.get(
      'SELECT * FROM services WHERE id = ? AND created_by = ? AND deleted_at IS NULL',
      [id, userId]
    );
  }

  async create(serviceData, userId) {
    const {
      name,
      description,
      category,
      price,
      duration_hours,
      active = true
    } = serviceData;

    const id = EncryptionUtils.generateUUID();

    await this.db.run(`
      INSERT INTO services (
        id, name, description, category, price, duration_hours,
        active, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [id, name, description, category, price, duration_hours, active, userId]);

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
      `UPDATE services SET ${fields.join(', ')} WHERE id = ? AND created_by = ?`,
      values
    );

    return await this.findById(id, userId);
  }

  async delete(id, userId) {
    await this.db.run(
      'UPDATE services SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND created_by = ?',
      [id, userId]
    );
  }

  async list(filters = {}, userId) {
    const { page = 1, limit = 10, search, category, active, sort = 'name', order = 'ASC' } = filters;
    const offset = (page - 1) * limit;

    let whereConditions = ['created_by = ?', 'deleted_at IS NULL'];
    let params = [userId];

    if (search) {
      whereConditions.push('(name LIKE ? OR description LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    if (category) {
      whereConditions.push('category = ?');
      params.push(category);
    }

    if (active !== undefined) {
      whereConditions.push('active = ?');
      params.push(active);
    }

    const validSortFields = ['name', 'category', 'price', 'duration_hours', 'created_at'];
    const sortField = validSortFields.includes(sort) ? sort : 'name';
    const sortOrder = ['ASC', 'DESC'].includes(order.toUpperCase()) ? order.toUpperCase() : 'ASC';

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const services = await this.db.all(`
      SELECT * FROM services
      ${whereClause}
      ORDER BY ${sortField} ${sortOrder}
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);

    const total = await this.db.get(`
      SELECT COUNT(*) as count FROM services ${whereClause}
    `, params);

    return {
      services,
      pagination: {
        page,
        limit,
        total: total.count,
        totalPages: Math.ceil(total.count / limit)
      }
    };
  }

  async getCategories(userId) {
    const categories = await this.db.all(`
      SELECT DISTINCT category
      FROM services
      WHERE created_by = ? AND category IS NOT NULL AND category != '' AND deleted_at IS NULL
      ORDER BY category
    `, [userId]);

    return categories.map(cat => cat.category);
  }

  async getStats(userId) {
    const stats = await this.db.get(`
      SELECT
        COUNT(*) as total_services,
        COUNT(CASE WHEN active = 1 THEN 1 END) as active_services,
        AVG(price) as average_price,
        AVG(duration_hours) as average_duration
      FROM services
      WHERE created_by = ? AND deleted_at IS NULL
    `, [userId]);

    const categoriesStats = await this.db.all(`
      SELECT
        category,
        COUNT(*) as count,
        AVG(price) as avg_price
      FROM services
      WHERE created_by = ? AND deleted_at IS NULL AND category IS NOT NULL
      GROUP BY category
      ORDER BY count DESC
    `, [userId]);

    return {
      ...stats,
      categories: categoriesStats
    };
  }

  async getPopular(userId, limit = 10) {
    return await this.db.all(`
      SELECT 
        s.*,
        COUNT(qi.service_id) as usage_count
      FROM services s
      LEFT JOIN quote_items qi ON s.id = qi.service_id
      LEFT JOIN quotes q ON qi.quote_id = q.id AND q.status = 'ACCEPTED'
      WHERE s.created_by = ? AND s.deleted_at IS NULL AND s.active = 1
      GROUP BY s.id
      ORDER BY usage_count DESC, s.name ASC
      LIMIT ?
    `, [userId, parseInt(limit)]);
  }

  async search(query, userId, limit = 10) {
    if (!query || query.length < 2) return [];

    return await this.db.all(`
      SELECT id, name, category, price, duration_hours
      FROM services
      WHERE created_by = ? AND deleted_at IS NULL
      AND (name LIKE ? OR description LIKE ?)
      ORDER BY name ASC
      LIMIT ?
    `, [userId, `%${query}%`, `%${query}%`, parseInt(limit)]);
  }
}

module.exports = Service;