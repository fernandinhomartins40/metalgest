const { Database } = require('../config/database');
const EncryptionUtils = require('../utils/encryption');

class User {
  constructor() {
    this.db = new Database();
  }

  async findById(id) {
    return await this.db.get('SELECT * FROM users WHERE id = ?', [id]);
  }

  async findByEmail(email) {
    return await this.db.get('SELECT * FROM users WHERE email = ?', [email]);
  }

  async findByEmailWithoutPassword(email) {
    return await this.db.get(
      'SELECT id, email, name, role, active, email_verified, plan, created_at FROM users WHERE email = ?',
      [email]
    );
  }

  async create(userData) {
    const {
      email,
      name,
      password,
      role = 'user',
      active = true,
      email_verified = false,
      plan = 'FREE'
    } = userData;

    const id = EncryptionUtils.generateUUID();
    const hashedPassword = await EncryptionUtils.hashPassword(password);

    const result = await this.db.run(`
      INSERT INTO users (
        id, email, name, password, role, active, 
        email_verified, plan, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [id, email, name, hashedPassword, role, active, email_verified, plan]);

    return await this.findById(id);
  }

  async update(id, updateData) {
    const fields = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && key !== 'id') {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });

    if (fields.length === 0) return null;

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await this.db.run(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return await this.findById(id);
  }

  async updatePassword(id, newPassword) {
    const hashedPassword = await EncryptionUtils.hashPassword(newPassword);
    
    await this.db.run(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, id]
    );

    return true;
  }

  async updateLastLogin(id) {
    await this.db.run(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
  }

  async delete(id) {
    await this.db.run('UPDATE users SET active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
  }

  async list(filters = {}) {
    const { page = 1, limit = 10, search, role, active } = filters;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let params = [];

    if (search) {
      whereConditions.push('(name LIKE ? OR email LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (role) {
      whereConditions.push('role = ?');
      params.push(role);
    }

    if (active !== undefined) {
      whereConditions.push('active = ?');
      params.push(active);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const users = await this.db.all(`
      SELECT id, email, name, role, active, email_verified, plan, created_at, updated_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);

    const total = await this.db.get(`
      SELECT COUNT(*) as count FROM users ${whereClause}
    `, params);

    return {
      users,
      pagination: {
        page,
        limit,
        total: total.count,
        totalPages: Math.ceil(total.count / limit)
      }
    };
  }

  async getStats() {
    const stats = await this.db.get(`
      SELECT
        COUNT(*) as total_users,
        COUNT(CASE WHEN active = 1 THEN 1 END) as active_users,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
        COUNT(CASE WHEN email_verified = 1 THEN 1 END) as verified_users
      FROM users
    `);

    return stats;
  }
}

module.exports = User;