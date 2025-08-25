const database = require('../config/database');
const auditService = require('../services/audit.service');
const { productSchema, productUpdateSchema, productSearchSchema } = require('../utils/validation');
const { AppError } = require('../utils/errors');

class ProductsController {

  // Criar produto
  async create(req, res) {
    try {
      const validatedData = productSchema.parse(req.body);
      const userId = req.user.id;

      const productData = {
        ...validatedData,
        created_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Verificar se SKU já existe (se fornecido)
      if (productData.sku) {
        const existingSku = await database.get(
          'SELECT id FROM products WHERE sku = ? AND active = 1',
          [productData.sku]
        );

        if (existingSku) {
          throw new AppError('SKU já existe', 400);
        }
      }

      const result = await database.run(`
        INSERT INTO products (
          name, description, sku, barcode, category,
          price, cost, stock, min_stock, unit,
          active, created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        productData.name,
        productData.description || null,
        productData.sku || null,
        productData.barcode || null,
        productData.category || null,
        productData.price,
        productData.cost || 0,
        productData.stock || 0,
        productData.min_stock || 0,
        productData.unit || 'UN',
        productData.active !== false,
        productData.created_by,
        productData.created_at,
        productData.updated_at
      ]);

      const product = await database.get(
        'SELECT * FROM products WHERE id = ?',
        [result.lastID]
      );

      await auditService.log({
        user_id: userId,
        action: 'CREATE',
        table_name: 'products',
        record_id: result.lastID,
        new_values: product,
        ip: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.status(201).json({
        success: true,
        data: product,
        message: 'Produto criado com sucesso'
      });
    } catch (error) {
      console.error('Error creating product:', error);
      
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

  // Listar produtos com paginação e filtros
  async list(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        category,
        active,
        low_stock,
        sort = 'name',
        order = 'ASC'
      } = productSearchSchema.parse(req.query);

      const offset = (page - 1) * limit;
      let whereConditions = ['active = 1'];
      let params = [];

      // Filtro por busca
      if (search) {
        whereConditions.push('(name LIKE ? OR description LIKE ? OR sku LIKE ? OR barcode LIKE ?)');
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }

      // Filtro por categoria
      if (category) {
        whereConditions.push('category = ?');
        params.push(category);
      }

      // Filtro por status ativo
      if (active !== undefined) {
        whereConditions.push('active = ?');
        params.push(active);
      }

      // Filtro por estoque baixo
      if (low_stock) {
        whereConditions.push('stock <= min_stock');
      }

      const whereClause = whereConditions.join(' AND ');
      
      // Validar campos de ordenação
      const validSortFields = ['name', 'category', 'price', 'stock', 'created_at'];
      const validOrders = ['ASC', 'DESC'];
      
      const sortField = validSortFields.includes(sort) ? sort : 'name';
      const sortOrder = validOrders.includes(order.toUpperCase()) ? order.toUpperCase() : 'ASC';

      // Buscar produtos
      const products = await database.all(`
        SELECT *
        FROM products
        WHERE ${whereClause}
        ORDER BY ${sortField} ${sortOrder}
        LIMIT ? OFFSET ?
      `, [...params, limit, offset]);

      // Contar total
      const totalResult = await database.get(`
        SELECT COUNT(*) as total
        FROM products
        WHERE ${whereClause}
      `, params);

      const total = totalResult.total;
      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: {
          products,
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
      console.error('Error listing products:', error);
      
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

  // Buscar produto por ID
  async getById(req, res) {
    try {
      const { id } = req.params;

      const product = await database.get(`
        SELECT p.*, u.name as created_by_name
        FROM products p
        LEFT JOIN users u ON p.created_by = u.id
        WHERE p.id = ? AND p.active = 1
      `, [id]);

      if (!product) {
        return res.status(404).json({
          success: false,
          error: { message: 'Produto não encontrado' }
        });
      }

      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      console.error('Error getting product:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor' }
      });
    }
  }

  // Atualizar produto
  async update(req, res) {
    try {
      const { id } = req.params;
      const validatedData = productUpdateSchema.parse(req.body);
      const userId = req.user.id;

      // Verificar se produto existe
      const existingProduct = await database.get(
        'SELECT * FROM products WHERE id = ? AND active = 1',
        [id]
      );

      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          error: { message: 'Produto não encontrado' }
        });
      }

      // Verificar se SKU já existe (se sendo alterado)
      if (validatedData.sku && validatedData.sku !== existingProduct.sku) {
        const existingSku = await database.get(
          'SELECT id FROM products WHERE sku = ? AND id != ? AND active = 1',
          [validatedData.sku, id]
        );

        if (existingSku) {
          throw new AppError('SKU já existe', 400);
        }
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
        UPDATE products
        SET ${updates.join(', ')}
        WHERE id = ?
      `, params);

      const updatedProduct = await database.get(
        'SELECT * FROM products WHERE id = ?',
        [id]
      );

      await auditService.log({
        user_id: userId,
        action: 'UPDATE',
        table_name: 'products',
        record_id: parseInt(id),
        old_values: existingProduct,
        new_values: updatedProduct,
        ip: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.json({
        success: true,
        data: updatedProduct,
        message: 'Produto atualizado com sucesso'
      });
    } catch (error) {
      console.error('Error updating product:', error);
      
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

  // Atualizar estoque
  async updateStock(req, res) {
    try {
      const { id } = req.params;
      const { quantity, operation, reason } = req.body;
      const userId = req.user.id;

      if (!['add', 'subtract', 'set'].includes(operation)) {
        return res.status(400).json({
          success: false,
          error: { message: 'Operação inválida. Use: add, subtract, set' }
        });
      }

      const product = await database.get(
        'SELECT * FROM products WHERE id = ? AND active = 1',
        [id]
      );

      if (!product) {
        return res.status(404).json({
          success: false,
          error: { message: 'Produto não encontrado' }
        });
      }

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

      await database.run(
        'UPDATE products SET stock = ?, updated_at = ? WHERE id = ?',
        [newStock, new Date().toISOString(), id]
      );

      const updatedProduct = await database.get(
        'SELECT * FROM products WHERE id = ?',
        [id]
      );

      await auditService.log({
        user_id: userId,
        action: 'STOCK_UPDATE',
        table_name: 'products',
        record_id: parseInt(id),
        old_values: { stock: product.stock },
        new_values: { stock: newStock, operation, quantity, reason },
        ip: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.json({
        success: true,
        data: updatedProduct,
        message: 'Estoque atualizado com sucesso'
      });
    } catch (error) {
      console.error('Error updating stock:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor' }
      });
    }
  }

  // Deletar produto (soft delete)
  async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const product = await database.get(
        'SELECT * FROM products WHERE id = ? AND active = 1',
        [id]
      );

      if (!product) {
        return res.status(404).json({
          success: false,
          error: { message: 'Produto não encontrado' }
        });
      }

      await database.run(
        'UPDATE products SET active = 0 WHERE id = ?',
        [id]
      );

      await auditService.log({
        user_id: userId,
        action: 'DELETE',
        table_name: 'products',
        record_id: parseInt(id),
        old_values: product,
        ip: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Produto deletado com sucesso'
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor' }
      });
    }
  }

  // Buscar categorias
  async getCategories(req, res) {
    try {
      const categories = await database.all(`
        SELECT DISTINCT category
        FROM products
        WHERE category IS NOT NULL 
        AND category != ''
        AND active = 1
        ORDER BY category
      `);

      res.json({
        success: true,
        data: categories.map(cat => cat.category)
      });
    } catch (error) {
      console.error('Error getting categories:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor' }
      });
    }
  }

  // Produtos com estoque baixo
  async getLowStock(req, res) {
    try {
      const products = await database.all(`
        SELECT *
        FROM products
        WHERE stock <= min_stock
        AND active = 1
        AND active = 1
        ORDER BY (stock - min_stock) ASC
      `);

      res.json({
        success: true,
        data: products
      });
    } catch (error) {
      console.error('Error getting low stock products:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor' }
      });
    }
  }
}

module.exports = new ProductsController();