const { v4: uuidv4 } = require('uuid');
const database = require('../config/database');
const { clientSchema, paginationSchema, idParamSchema } = require('../utils/validation');
const auditService = require('../services/audit.service');

class ClientsController {
  async getAll(req, res) {
    try {
      const { page = 1, limit = 10, search = '', category } = req.query;
      const offset = (page - 1) * limit;

      let query = `
        SELECT * FROM clients 
        WHERE user_id = ? AND active = 1
      `;
      const params = [req.user.id];

      if (search) {
        query += ` AND (name LIKE ? OR document LIKE ? OR email LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      if (category) {
        query += ` AND category = ?`;
        params.push(category);
      }

      query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
      params.push(parseInt(limit), offset);

      const clients = await database.all(query, params);

      // Get total count
      let countQuery = `
        SELECT COUNT(*) as total FROM clients 
        WHERE user_id = ? AND active = 1
      `;
      const countParams = [req.user.id];

      if (search) {
        countQuery += ` AND (name LIKE ? OR document LIKE ? OR email LIKE ?)`;
        countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      if (category) {
        countQuery += ` AND category = ?`;
        countParams.push(category);
      }

      const { total } = await database.get(countQuery, countParams);

      await auditService.logList(req.user.id, 'clients', {
        search,
        category,
        page,
        limit
      }, clients.length, req);

      res.json({
        success: true,
        data: {
          data: clients,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      console.error('Get clients error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor' }
      });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;

      const client = await database.get(
        'SELECT * FROM clients WHERE id = ? AND user_id = ? AND active = 1',
        [id, req.user.id]
      );

      if (!client) {
        return res.status(404).json({
          success: false,
          error: { message: 'Cliente não encontrado' }
        });
      }

      await auditService.logView(req.user.id, 'clients', id, req);

      res.json({
        success: true,
        data: client
      });

    } catch (error) {
      console.error('Get client error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor' }
      });
    }
  }

  async create(req, res) {
    try {
      const validatedData = clientSchema.parse(req.body);
      const clientId = uuidv4();

      // Check if document already exists for this user
      const existingClient = await database.get(
        'SELECT * FROM clients WHERE document = ? AND user_id = ? AND active = 1',
        [validatedData.document, req.user.id]
      );

      if (existingClient) {
        return res.status(400).json({
          success: false,
          error: { message: 'Cliente com este documento já existe' }
        });
      }

      await database.run(`
        INSERT INTO clients (
          id, person_type, name, trading_name, document, state_registration,
          municipal_registration, zip_code, street, number, complement,
          neighborhood, city, state, phone, mobile, email, contact_name,
          contact_role, category, notes, user_id, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [
        clientId, 
        validatedData.personType || 'FISICA',
        validatedData.name,
        validatedData.tradingName || null,
        validatedData.document,
        validatedData.stateRegistration || null,
        validatedData.municipalRegistration || null,
        validatedData.zipCode || null,
        validatedData.street || null,
        validatedData.number || null,
        validatedData.complement || null,
        validatedData.neighborhood || null,
        validatedData.city || null,
        validatedData.state || null,
        validatedData.phone || null,
        validatedData.mobile || null,
        validatedData.email || null,
        validatedData.contactName || null,
        validatedData.contactRole || null,
        validatedData.category || 'REGULAR',
        validatedData.notes || null,
        req.user.id
      ]);

      const client = await database.get(
        'SELECT * FROM clients WHERE id = ?',
        [clientId]
      );

      await auditService.logCreate(req.user.id, 'clients', clientId, {
        name: client.name,
        document: client.document,
        category: client.category
      }, req);

      res.status(201).json({
        success: true,
        data: client
      });

    } catch (error) {
      console.error('Create client error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Erro interno do servidor' }
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const validatedData = clientSchema.parse(req.body);

      // Check if client exists and belongs to user
      const existingClient = await database.get(
        'SELECT * FROM clients WHERE id = ? AND user_id = ? AND active = 1',
        [id, req.user.id]
      );

      if (!existingClient) {
        return res.status(404).json({
          success: false,
          error: { message: 'Cliente não encontrado' }
        });
      }

      // Check if document already exists for another client
      if (validatedData.document !== existingClient.document) {
        const duplicateClient = await database.get(
          'SELECT * FROM clients WHERE document = ? AND user_id = ? AND id != ? AND active = 1',
          [validatedData.document, req.user.id, id]
        );

        if (duplicateClient) {
          return res.status(400).json({
            success: false,
            error: { message: 'Outro cliente com este documento já existe' }
          });
        }
      }

      await database.run(`
        UPDATE clients SET
          person_type = ?, name = ?, trading_name = ?, document = ?,
          state_registration = ?, municipal_registration = ?, zip_code = ?,
          street = ?, number = ?, complement = ?, neighborhood = ?, city = ?,
          state = ?, phone = ?, mobile = ?, email = ?, contact_name = ?,
          contact_role = ?, category = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [
        validatedData.personType || existingClient.person_type,
        validatedData.name,
        validatedData.tradingName || null,
        validatedData.document,
        validatedData.stateRegistration || null,
        validatedData.municipalRegistration || null,
        validatedData.zipCode || null,
        validatedData.street || null,
        validatedData.number || null,
        validatedData.complement || null,
        validatedData.neighborhood || null,
        validatedData.city || null,
        validatedData.state || null,
        validatedData.phone || null,
        validatedData.mobile || null,
        validatedData.email || null,
        validatedData.contactName || null,
        validatedData.contactRole || null,
        validatedData.category || existingClient.category,
        validatedData.notes || null,
        id
      ]);

      const updatedClient = await database.get(
        'SELECT * FROM clients WHERE id = ?',
        [id]
      );

      await auditService.logUpdate(req.user.id, 'clients', id, {
        changes: validatedData,
        previousData: {
          name: existingClient.name,
          document: existingClient.document,
          email: existingClient.email
        }
      }, req);

      res.json({
        success: true,
        data: updatedClient
      });

    } catch (error) {
      console.error('Update client error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Erro interno do servidor' }
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      const client = await database.get(
        'SELECT * FROM clients WHERE id = ? AND user_id = ? AND active = 1',
        [id, req.user.id]
      );

      if (!client) {
        return res.status(404).json({
          success: false,
          error: { message: 'Cliente não encontrado' }
        });
      }

      // Check if client has associated quotes
      const hasQuotes = await database.get(
        'SELECT COUNT(*) as count FROM quotes WHERE client_id = ?',
        [id]
      );

      if (hasQuotes.count > 0) {
        return res.status(400).json({
          success: false,
          error: { message: 'Não é possível excluir cliente com orçamentos associados' }
        });
      }

      // Soft delete
      await database.run(
        'UPDATE clients SET active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
      );

      await auditService.logDelete(req.user.id, 'clients', id, {
        name: client.name,
        document: client.document,
        email: client.email
      }, req);

      res.json({
        success: true,
        data: { message: 'Cliente removido com sucesso' }
      });

    } catch (error) {
      console.error('Delete client error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor' }
      });
    }
  }

  async search(req, res) {
    try {
      const { q: query, limit = 10 } = req.query;

      if (!query || query.length < 2) {
        return res.json({
          success: true,
          data: []
        });
      }

      const clients = await database.all(`
        SELECT id, name, document, email, phone, category 
        FROM clients 
        WHERE user_id = ? AND active = 1 
        AND (name LIKE ? OR document LIKE ? OR email LIKE ?)
        ORDER BY name ASC
        LIMIT ?
      `, [req.user.id, `%${query}%`, `%${query}%`, `%${query}%`, parseInt(limit)]);

      await auditService.logSearch(req.user.id, 'clients', query, clients.length, req);

      res.json({
        success: true,
        data: clients
      });

    } catch (error) {
      console.error('Search clients error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor' }
      });
    }
  }

  async getStats(req, res) {
    try {
      const stats = await Promise.all([
        // Total clients
        database.get(
          'SELECT COUNT(*) as total FROM clients WHERE user_id = ? AND active = 1',
          [req.user.id]
        ),
        // Clients by category
        database.all(
          'SELECT category, COUNT(*) as count FROM clients WHERE user_id = ? AND active = 1 GROUP BY category',
          [req.user.id]
        ),
        // New clients this month
        database.get(
          `SELECT COUNT(*) as count FROM clients 
           WHERE user_id = ? AND active = 1 
           AND created_at >= date('now', 'start of month')`,
          [req.user.id]
        ),
        // Clients with quotes
        database.get(
          `SELECT COUNT(DISTINCT c.id) as count FROM clients c
           INNER JOIN quotes q ON c.id = q.client_id
           WHERE c.user_id = ? AND c.active = 1`,
          [req.user.id]
        )
      ]);

      await auditService.log(req.user.id, 'get_stats', 'clients', {}, req);

      res.json({
        success: true,
        data: {
          total: stats[0].total,
          byCategory: stats[1],
          newThisMonth: stats[2].count,
          withQuotes: stats[3].count
        }
      });

    } catch (error) {
      console.error('Get client stats error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor' }
      });
    }
  }
}

module.exports = new ClientsController();