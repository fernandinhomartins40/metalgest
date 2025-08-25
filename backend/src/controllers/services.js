const database = require('../config/database');
const auditService = require('../services/audit.service');
const { serviceSchema, serviceUpdateSchema, serviceSearchSchema } = require('../utils/validation');
const { AppError } = require('../utils/errors');

class ServicesController {

  // Criar serviço
  async create(req, res) {
    try {
      const validatedData = serviceSchema.parse(req.body);
      const userId = req.user.id;

      const serviceData = {
        ...validatedData,
        created_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const result = await database.run(`
        INSERT INTO services (
          name, description, category, price, duration_hours,
          active, created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        serviceData.name,
        serviceData.description || null,
        serviceData.category || null,
        serviceData.price,
        serviceData.duration_hours || null,
        serviceData.active !== false,
        serviceData.created_by,
        serviceData.created_at,
        serviceData.updated_at
      ]);

      const service = await database.get(
        'SELECT * FROM services WHERE id = ?',
        [result.lastID]
      );

      await auditService.log({
        user_id: userId,
        action: 'CREATE',
        table_name: 'services',
        record_id: result.lastID,
        new_values: service,
        ip: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.status(201).json({
        success: true,
        data: service,
        message: 'Serviço criado com sucesso'
      });
    } catch (error) {
      console.error('Error creating service:', error);
      
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

  // Listar serviços com paginação e filtros
  async list(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        category,
        active,
        sort = 'name',
        order = 'ASC'
      } = serviceSearchSchema.parse(req.query);

      const offset = (page - 1) * limit;
      let whereConditions = ['active = 1'];
      let params = [];

      // Filtro por busca
      if (search) {
        whereConditions.push('(name LIKE ? OR description LIKE ?)');
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
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

      const whereClause = whereConditions.join(' AND ');
      
      // Validar campos de ordenação
      const validSortFields = ['name', 'category', 'price', 'duration_hours', 'created_at'];
      const validOrders = ['ASC', 'DESC'];
      
      const sortField = validSortFields.includes(sort) ? sort : 'name';
      const sortOrder = validOrders.includes(order.toUpperCase()) ? order.toUpperCase() : 'ASC';

      // Buscar serviços
      const services = await database.all(`
        SELECT *
        FROM services
        WHERE ${whereClause}
        ORDER BY ${sortField} ${sortOrder}
        LIMIT ? OFFSET ?
      `, [...params, limit, offset]);

      // Contar total
      const totalResult = await database.get(`
        SELECT COUNT(*) as total
        FROM services
        WHERE ${whereClause}
      `, params);

      const total = totalResult.total;
      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: {
          services,
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
      console.error('Error listing services:', error);
      
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

  // Buscar serviço por ID
  async getById(req, res) {
    try {
      const { id } = req.params;

      const service = await database.get(`
        SELECT s.*, u.name as created_by_name
        FROM services s
        LEFT JOIN users u ON s.created_by = u.id
        WHERE s.id = ? AND s.active = 1
      `, [id]);

      if (!service) {
        return res.status(404).json({
          success: false,
          error: { message: 'Serviço não encontrado' }
        });
      }

      res.json({
        success: true,
        data: service
      });
    } catch (error) {
      console.error('Error getting service:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor' }
      });
    }
  }

  // Atualizar serviço
  async update(req, res) {
    try {
      const { id } = req.params;
      const validatedData = serviceUpdateSchema.parse(req.body);
      const userId = req.user.id;

      // Verificar se serviço existe
      const existingService = await database.get(
        'SELECT * FROM services WHERE id = ? AND active = 1',
        [id]
      );

      if (!existingService) {
        return res.status(404).json({
          success: false,
          error: { message: 'Serviço não encontrado' }
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
        UPDATE services
        SET ${updates.join(', ')}
        WHERE id = ?
      `, params);

      const updatedService = await database.get(
        'SELECT * FROM services WHERE id = ?',
        [id]
      );

      await auditService.log({
        user_id: userId,
        action: 'UPDATE',
        table_name: 'services',
        record_id: parseInt(id),
        old_values: existingService,
        new_values: updatedService,
        ip: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.json({
        success: true,
        data: updatedService,
        message: 'Serviço atualizado com sucesso'
      });
    } catch (error) {
      console.error('Error updating service:', error);
      
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

  // Deletar serviço (soft delete)
  async delete(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const service = await database.get(
        'SELECT * FROM services WHERE id = ? AND active = 1',
        [id]
      );

      if (!service) {
        return res.status(404).json({
          success: false,
          error: { message: 'Serviço não encontrado' }
        });
      }

      await database.run(
        'UPDATE services SET active = 0 WHERE id = ?',
        [id]
      );

      await auditService.log({
        user_id: userId,
        action: 'DELETE',
        table_name: 'services',
        record_id: parseInt(id),
        old_values: service,
        ip: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Serviço deletado com sucesso'
      });
    } catch (error) {
      console.error('Error deleting service:', error);
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
        FROM services
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

  // Estatísticas de serviços
  async getStats(req, res) {
    try {
      const stats = await database.get(`
        SELECT
          COUNT(*) as total_services,
          COUNT(CASE WHEN active = 1 THEN 1 END) as active_services,
          AVG(price) as average_price,
          AVG(duration_hours) as average_duration
        FROM services
        WHERE active = 1
      `);

      const categoriesStats = await database.all(`
        SELECT
          category,
          COUNT(*) as count,
          AVG(price) as avg_price
        FROM services
        WHERE active = 1 AND category IS NOT NULL
        GROUP BY category
        ORDER BY count DESC
      `);

      res.json({
        success: true,
        data: {
          ...stats,
          categories: categoriesStats
        }
      });
    } catch (error) {
      console.error('Error getting service stats:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor' }
      });
    }
  }

  // Serviços populares (baseado em orçamentos)
  async getPopular(req, res) {
    try {
      const { limit = 10 } = req.query;

      const popularServices = await database.all(`
        SELECT 
          s.*,
          COUNT(qi.service_id) as usage_count
        FROM services s
        LEFT JOIN quote_items qi ON s.id = qi.service_id
        WHERE s.active = 1 AND s.active = 1
        GROUP BY s.id
        ORDER BY usage_count DESC, s.name ASC
        LIMIT ?
      `, [parseInt(limit)]);

      res.json({
        success: true,
        data: popularServices
      });
    } catch (error) {
      console.error('Error getting popular services:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor' }
      });
    }
  }
}

module.exports = new ServicesController();