const { Database } = require('../config/database');
const EncryptionUtils = require('../utils/encryption');

class Product {
  constructor() {
    this.db = new Database();
  }

  async findById(id, userId) {
    return await this.db.get(
      'SELECT * FROM products WHERE id = ? AND created_by = ? AND deleted_at IS NULL',
      [id, userId]
    );
  }

  async findBySku(sku, userId) {
    return await this.db.get(
      'SELECT * FROM products WHERE sku = ? AND created_by = ? AND deleted_at IS NULL',
      [sku, userId]
    );
  }

  async create(productData, userId) {
    const {
      name,
      description,
      sku,
      barcode,
      category,
      price,
      cost = 0,
      stock = 0,
      min_stock = 0,
      unit = 'UN',
      active = true
    } = productData;

    const id = EncryptionUtils.generateUUID();

    await this.db.run(`
      INSERT INTO products (
        id, name, description, sku, barcode, category,
        price, cost, stock, min_stock, unit,
        active, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [
      id, name, description, sku, barcode, category,
      price, cost, stock, min_stock, unit,
      active, userId
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
      `UPDATE products SET ${fields.join(', ')} WHERE id = ? AND created_by = ?`,
      values
    );

    return await this.findById(id, userId);
  }

  async updateStock(id, operation, quantity, userId) {
    const product = await this.findById(id, userId);
    if (!product) return null;

    let newStock = product.stock;

    switch (operation) {
      case 'add':
        newStock += quantity;
        break;
      case 'subtract':
        newStock -= quantity;
        if (newStock < 0) newStock = 0;
        break;
      case 'set':
        newStock = quantity;
        break;
    }

    await this.db.run(
      'UPDATE products SET stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND created_by = ?',
      [newStock, id, userId]
    );

    return await this.findById(id, userId);
  }

  async delete(id, userId) {
    await this.db.run(
      'UPDATE products SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND created_by = ?',
      [id, userId]
    );
  }

  async list(filters = {}, userId) {
    const { page = 1, limit = 10, search, category, active, low_stock, sort = 'name', order = 'ASC' } = filters;
    const offset = (page - 1) * limit;

    let whereConditions = ['created_by = ?', 'deleted_at IS NULL'];
    let params = [userId];

    if (search) {
      whereConditions.push('(name LIKE ? OR description LIKE ? OR sku LIKE ? OR barcode LIKE ?)');
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (category) {
      whereConditions.push('category = ?');
      params.push(category);
    }

    if (active !== undefined) {
      whereConditions.push('active = ?');
      params.push(active);
    }

    if (low_stock) {
      whereConditions.push('stock <= min_stock');
    }

    const validSortFields = ['name', 'category', 'price', 'stock', 'created_at'];
    const sortField = validSortFields.includes(sort) ? sort : 'name';
    const sortOrder = ['ASC', 'DESC'].includes(order.toUpperCase()) ? order.toUpperCase() : 'ASC';

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const products = await this.db.all(`
      SELECT * FROM products
      ${whereClause}
      ORDER BY ${sortField} ${sortOrder}
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);

    const total = await this.db.get(`
      SELECT COUNT(*) as count FROM products ${whereClause}
    `, params);

    return {
      products,
      pagination: {
        page,
        limit,
        total: total.count,
        totalPages: Math.ceil(total.count / limit)
      }
    };
  }

  async getLowStockProducts(userId) {
    return await this.db.all(`
      SELECT *
      FROM products
      WHERE created_by = ? AND stock <= min_stock
      AND active = 1 AND deleted_at IS NULL
      ORDER BY (stock - min_stock) ASC
    `, [userId]);
  }

  async getCategories(userId) {
    const categories = await this.db.all(`
      SELECT DISTINCT category
      FROM products
      WHERE created_by = ? AND category IS NOT NULL AND category != '' AND deleted_at IS NULL
      ORDER BY category
    `, [userId]);

    return categories.map(cat => cat.category);
  }

  async getStats(userId) {
    const stats = await this.db.get(`
      SELECT
        COUNT(*) as total_products,
        COUNT(CASE WHEN active = 1 THEN 1 END) as active_products,
        COUNT(CASE WHEN stock <= min_stock THEN 1 END) as low_stock_products,
        SUM(stock * cost) as inventory_value
      FROM products
      WHERE created_by = ? AND deleted_at IS NULL
    `, [userId]);

    const categoriesStats = await this.db.all(`
      SELECT
        category,
        COUNT(*) as count,
        AVG(price) as avg_price
      FROM products
      WHERE created_by = ? AND deleted_at IS NULL AND category IS NOT NULL
      GROUP BY category
      ORDER BY count DESC
    `, [userId]);

    return {
      ...stats,
      categories: categoriesStats
    };
  }

  async search(query, userId, limit = 10) {
    if (!query || query.length < 2) return [];

    return await this.db.all(`
      SELECT id, name, sku, price, stock
      FROM products
      WHERE created_by = ? AND deleted_at IS NULL
      AND (name LIKE ? OR sku LIKE ? OR barcode LIKE ?)
      ORDER BY name ASC
      LIMIT ?
    `, [userId, `%${query}%`, `%${query}%`, `%${query}%`, parseInt(limit)]);
  }
}

module.exports = Product;