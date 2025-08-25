const database = require('../config/database');
const auditService = require('../services/audit.service');
const { userCreateSchema, userUpdateSchema, userSearchSchema, passwordChangeSchema } = require('../utils/validation');
const { AppError } = require('../utils/errors');
const bcrypt = require('bcryptjs');

class UsersController {

  // Criar usuário (apenas admin)
  async create(req, res) {
    try {
      // Verificar se usuário é admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: { message: 'Acesso negado. Apenas administradores podem criar usuários.' }
        });
      }

      const validatedData = userCreateSchema.parse(req.body);
      const adminUserId = req.user.id;

      // Verificar se email já existe
      const existingUser = await database.get(
        'SELECT id FROM users WHERE email = ?',
        [validatedData.email]
      );

      if (existingUser) {
        throw new AppError('Email já está em uso', 400);
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(validatedData.password, 12);

      const userData = {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role || 'user',
        active: validatedData.active !== false,
        email_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const result = await database.run(`
        INSERT INTO users (
          name, email, password, role, active, 
          email_verified, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        userData.name,
        userData.email,
        userData.password,
        userData.role,
        userData.active,
        userData.email_verified,
        userData.created_at,
        userData.updated_at
      ]);

      const user = await database.get(
        'SELECT id, name, email, role, active, email_verified, created_at FROM users WHERE id = ?',
        [result.lastID]
      );

      await auditService.log({
        user_id: adminUserId,
        action: 'CREATE',
        table_name: 'users',
        record_id: result.lastID,
        new_values: { ...user, created_by_admin: true },
        ip: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.status(201).json({
        success: true,
        data: user,
        message: 'Usuário criado com sucesso'
      });
    } catch (error) {
      console.error('Error creating user:', error);
      
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

  // Listar usuários com paginação e filtros (apenas admin)
  async list(req, res) {
    try {
      // Verificar se usuário é admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: { message: 'Acesso negado. Apenas administradores podem listar usuários.' }
        });
      }

      const {
        page = 1,
        limit = 10,
        search,
        role,
        active,
        sort = 'name',
        order = 'ASC'
      } = userSearchSchema.parse(req.query);

      const offset = (page - 1) * limit;
      let whereConditions = [];
      let params = [];

      // Filtro por busca
      if (search) {
        whereConditions.push('(name LIKE ? OR email LIKE ?)');
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm);
      }

      // Filtro por role
      if (role) {
        whereConditions.push('role = ?');
        params.push(role);
      }

      // Filtro por status ativo
      if (active !== undefined) {
        whereConditions.push('active = ?');
        params.push(active);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
      
      // Validar campos de ordenação
      const validSortFields = ['name', 'email', 'role', 'created_at'];
      const validOrders = ['ASC', 'DESC'];
      
      const sortField = validSortFields.includes(sort) ? sort : 'name';
      const sortOrder = validOrders.includes(order.toUpperCase()) ? order.toUpperCase() : 'ASC';

      // Buscar usuários (sem senhas)
      const users = await database.all(`
        SELECT 
          id, name, email, role, active, email_verified, created_at, updated_at
        FROM users
        ${whereClause}
        ORDER BY ${sortField} ${sortOrder}
        LIMIT ? OFFSET ?
      `, [...params, limit, offset]);

      // Contar total
      const totalResult = await database.get(`
        SELECT COUNT(*) as total
        FROM users
        ${whereClause}
      `, params);

      const total = totalResult.total;
      const totalPages = Math.ceil(total / limit);

      res.json({
        success: true,
        data: {
          users,
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
      console.error('Error listing users:', error);
      
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

  // Buscar usuário por ID
  async getById(req, res) {
    try {
      const { id } = req.params;

      // Usuários só podem ver seus próprios dados, admins podem ver qualquer um
      if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
        return res.status(403).json({
          success: false,
          error: { message: 'Acesso negado' }
        });
      }

      const user = await database.get(`
        SELECT id, name, email, role, active, email_verified, created_at, updated_at
        FROM users 
        WHERE id = ?
      `, [id]);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: { message: 'Usuário não encontrado' }
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor' }
      });
    }
  }

  // Atualizar usuário
  async update(req, res) {
    try {
      const { id } = req.params;
      const validatedData = userUpdateSchema.parse(req.body);
      const currentUserId = req.user.id;

      // Usuários só podem editar seus próprios dados (exceto role/active), admins podem editar qualquer um
      if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
        return res.status(403).json({
          success: false,
          error: { message: 'Acesso negado' }
        });
      }

      // Verificar se usuário existe
      const existingUser = await database.get(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );

      if (!existingUser) {
        return res.status(404).json({
          success: false,
          error: { message: 'Usuário não encontrado' }
        });
      }

      // Se não é admin, remover campos que não pode alterar
      if (req.user.role !== 'admin') {
        delete validatedData.role;
        delete validatedData.active;
        delete validatedData.email_verified;
      }

      // Verificar se email já existe (se sendo alterado)
      if (validatedData.email && validatedData.email !== existingUser.email) {
        const existingEmail = await database.get(
          'SELECT id FROM users WHERE email = ? AND id != ?',
          [validatedData.email, id]
        );

        if (existingEmail) {
          throw new AppError('Email já está em uso', 400);
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

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          error: { message: 'Nenhum campo para atualizar' }
        });
      }

      updates.push('updated_at = ?');
      params.push(new Date().toISOString());
      params.push(id);

      await database.run(`
        UPDATE users
        SET ${updates.join(', ')}
        WHERE id = ?
      `, params);

      const updatedUser = await database.get(
        'SELECT id, name, email, role, active, email_verified, created_at, updated_at FROM users WHERE id = ?',
        [id]
      );

      await auditService.log({
        user_id: currentUserId,
        action: 'UPDATE',
        table_name: 'users',
        record_id: parseInt(id),
        old_values: { ...existingUser, password: '[HIDDEN]' },
        new_values: updatedUser,
        ip: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.json({
        success: true,
        data: updatedUser,
        message: 'Usuário atualizado com sucesso'
      });
    } catch (error) {
      console.error('Error updating user:', error);
      
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

  // Alterar senha
  async changePassword(req, res) {
    try {
      const { id } = req.params;
      const validatedData = passwordChangeSchema.parse(req.body);
      const currentUserId = req.user.id;

      // Usuários só podem alterar sua própria senha, admins podem alterar qualquer uma
      if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
        return res.status(403).json({
          success: false,
          error: { message: 'Acesso negado' }
        });
      }

      const user = await database.get(
        'SELECT id, password FROM users WHERE id = ?',
        [id]
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          error: { message: 'Usuário não encontrado' }
        });
      }

      // Se não é admin, verificar senha atual
      if (req.user.role !== 'admin') {
        if (!validatedData.current_password) {
          return res.status(400).json({
            success: false,
            error: { message: 'Senha atual é obrigatória' }
          });
        }

        const isCurrentPasswordValid = await bcrypt.compare(validatedData.current_password, user.password);
        if (!isCurrentPasswordValid) {
          return res.status(400).json({
            success: false,
            error: { message: 'Senha atual incorreta' }
          });
        }
      }

      // Hash da nova senha
      const hashedPassword = await bcrypt.hash(validatedData.new_password, 12);

      await database.run(
        'UPDATE users SET password = ?, updated_at = ? WHERE id = ?',
        [hashedPassword, new Date().toISOString(), id]
      );

      await auditService.log({
        user_id: currentUserId,
        action: 'PASSWORD_CHANGE',
        table_name: 'users',
        record_id: parseInt(id),
        new_values: { changed_by_admin: req.user.role === 'admin' },
        ip: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Senha alterada com sucesso'
      });
    } catch (error) {
      console.error('Error changing password:', error);
      
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

  // Ativar/desativar usuário (apenas admin)
  async toggleActive(req, res) {
    try {
      const { id } = req.params;
      const { active } = req.body;
      const adminUserId = req.user.id;

      // Verificar se usuário é admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: { message: 'Acesso negado. Apenas administradores podem ativar/desativar usuários.' }
        });
      }

      // Não pode desativar a si mesmo
      if (parseInt(id) === adminUserId) {
        return res.status(400).json({
          success: false,
          error: { message: 'Você não pode desativar sua própria conta' }
        });
      }

      const user = await database.get(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          error: { message: 'Usuário não encontrado' }
        });
      }

      await database.run(
        'UPDATE users SET active = ?, updated_at = ? WHERE id = ?',
        [active, new Date().toISOString(), id]
      );

      const updatedUser = await database.get(
        'SELECT id, name, email, role, active, email_verified, created_at, updated_at FROM users WHERE id = ?',
        [id]
      );

      await auditService.log({
        user_id: adminUserId,
        action: active ? 'ACTIVATE' : 'DEACTIVATE',
        table_name: 'users',
        record_id: parseInt(id),
        old_values: { active: user.active },
        new_values: { active },
        ip: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.json({
        success: true,
        data: updatedUser,
        message: `Usuário ${active ? 'ativado' : 'desativado'} com sucesso`
      });
    } catch (error) {
      console.error('Error toggling user status:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor' }
      });
    }
  }

  // Deletar usuário (apenas admin)
  async delete(req, res) {
    try {
      const { id } = req.params;
      const adminUserId = req.user.id;

      // Verificar se usuário é admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: { message: 'Acesso negado. Apenas administradores podem deletar usuários.' }
        });
      }

      // Não pode deletar a si mesmo
      if (parseInt(id) === adminUserId) {
        return res.status(400).json({
          success: false,
          error: { message: 'Você não pode deletar sua própria conta' }
        });
      }

      const user = await database.get(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          error: { message: 'Usuário não encontrado' }
        });
      }

      // Verificar se usuário tem dados relacionados
      const hasClients = await database.get(
        'SELECT COUNT(*) as count FROM clients WHERE created_by = ?',
        [id]
      );

      const hasQuotes = await database.get(
        'SELECT COUNT(*) as count FROM quotes WHERE created_by = ?',
        [id]
      );

      if (hasClients.count > 0 || hasQuotes.count > 0) {
        return res.status(400).json({
          success: false,
          error: { 
            message: 'Não é possível deletar usuário com dados relacionados. Desative-o ao invés de deletar.',
            details: {
              clients: hasClients.count,
              quotes: hasQuotes.count
            }
          }
        });
      }

      // Deletar tokens de refresh do usuário
      await database.run('DELETE FROM refresh_tokens WHERE user_id = ?', [id]);

      // Deletar usuário
      await database.run('DELETE FROM users WHERE id = ?', [id]);

      await auditService.log({
        user_id: adminUserId,
        action: 'DELETE',
        table_name: 'users',
        record_id: parseInt(id),
        old_values: { ...user, password: '[HIDDEN]' },
        ip: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Usuário deletado com sucesso'
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor' }
      });
    }
  }

  // Estatísticas de usuários (apenas admin)
  async getStats(req, res) {
    try {
      // Verificar se usuário é admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: { message: 'Acesso negado' }
        });
      }

      const stats = await database.get(`
        SELECT
          COUNT(*) as total_users,
          COUNT(CASE WHEN active = 1 THEN 1 END) as active_users,
          COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_users,
          COUNT(CASE WHEN email_verified = 1 THEN 1 END) as verified_users,
          COUNT(CASE WHEN created_at >= date('now', '-30 days') THEN 1 END) as new_users_month
        FROM users
      `);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error getting user stats:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor' }
      });
    }
  }
}

module.exports = new UsersController();