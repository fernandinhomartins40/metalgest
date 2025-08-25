const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const database = require('../config/database');
const { loginSchema, registerSchema, refreshTokenSchema } = require('../utils/validation');
const auditService = require('../services/audit.service');

class AuthController {
  async register(req, res) {
    try {
      const validatedData = registerSchema.parse(req.body);
      const { email, password, name } = validatedData;

      // Check if user exists
      const existingUser = await database.get(
        'SELECT * FROM users WHERE email = ?', 
        [email]
      );

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: { message: 'Usuário já existe com este email' }
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);
      const userId = uuidv4();

      // Create user
      await database.run(`
        INSERT INTO users (id, email, name, password, created_at, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [userId, email, name, hashedPassword]);

      // Create default settings
      await database.run(`
        INSERT INTO settings (id, user_id, created_at, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [uuidv4(), userId]);

      // Generate tokens
      const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      });

      const refreshToken = jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'
      });

      // Store refresh token
      const refreshTokenId = uuidv4();
      await database.run(`
        INSERT INTO refresh_tokens (id, token, user_id, expires_at)
        VALUES (?, ?, ?, datetime('now', '+7 days'))
      `, [refreshTokenId, refreshToken, userId]);

      const user = await database.get(
        'SELECT id, email, name, role, plan, active, created_at FROM users WHERE id = ?',
        [userId]
      );

      // Log registration
      await auditService.log(userId, 'register', 'auth', {
        email: user.email,
        name: user.name
      }, req);

      res.status(201).json({
        success: true,
        data: {
          user,
          token,
          refreshToken
        }
      });

    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Erro interno do servidor' }
      });
    }
  }

  async login(req, res) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const { email, password } = validatedData;

      // Find user
      const user = await database.get(
        'SELECT * FROM users WHERE email = ? AND active = 1',
        [email]
      );

      if (!user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Credenciais inválidas' }
        });
      }

      // Check password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({
          success: false,
          error: { message: 'Credenciais inválidas' }
        });
      }

      // Update last login
      await database.run(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
        [user.id]
      );

      // Generate tokens
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      });

      const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d'
      });

      // Store refresh token
      const refreshTokenId = uuidv4();
      await database.run(`
        INSERT INTO refresh_tokens (id, token, user_id, expires_at)
        VALUES (?, ?, ?, datetime('now', '+7 days'))
      `, [refreshTokenId, refreshToken, user.id]);

      const { password: _, ...userWithoutPassword } = user;

      // Log login
      await auditService.log(user.id, 'login', 'auth', {
        email: user.email,
        lastLogin: new Date().toISOString()
      }, req);

      res.json({
        success: true,
        data: {
          user: userWithoutPassword,
          token,
          refreshToken
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: { message: error.message || 'Erro interno do servidor' }
      });
    }
  }

  async refreshToken(req, res) {
    try {
      const validatedData = refreshTokenSchema.parse(req.body);
      const { refreshToken } = validatedData;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          error: { message: 'Refresh token necessário' }
        });
      }

      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      
      // Check if refresh token exists in database and is not expired
      const storedToken = await database.get(
        'SELECT * FROM refresh_tokens WHERE token = ? AND user_id = ? AND expires_at > datetime()',
        [refreshToken, decoded.id]
      );

      if (!storedToken) {
        return res.status(401).json({
          success: false,
          error: { message: 'Refresh token inválido ou expirado' }
        });
      }

      // Check if user is still active
      const user = await database.get(
        'SELECT * FROM users WHERE id = ? AND active = 1',
        [decoded.id]
      );

      if (!user) {
        return res.status(401).json({
          success: false,
          error: { message: 'Usuário inativo' }
        });
      }

      // Generate new access token
      const newToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      });

      // Log token refresh
      await auditService.log(decoded.id, 'refresh_token', 'auth', {
        email: user.email
      }, req);

      res.json({
        success: true,
        data: { token: newToken }
      });

    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(401).json({
        success: false,
        error: { message: 'Refresh token inválido' }
      });
    }
  }

  async logout(req, res) {
    try {
      const validatedData = refreshTokenSchema.parse(req.body);
      const { refreshToken } = validatedData;
      
      if (refreshToken) {
        // Remove refresh token from database
        await database.run(
          'DELETE FROM refresh_tokens WHERE token = ?',
          [refreshToken]
        );

        // Try to get user ID from token for audit log
        try {
          const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
          await auditService.log(decoded.id, 'logout', 'auth', {}, req);
        } catch (tokenError) {
          // Token might be expired, ignore for audit purposes
        }
      }

      res.json({
        success: true,
        data: { message: 'Logout realizado com sucesso' }
      });

    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor' }
      });
    }
  }

  async me(req, res) {
    try {
      const { password, ...userWithoutPassword } = req.user;
      
      // Log profile access
      await auditService.log(req.user.id, 'get_profile', 'auth', {
        userId: req.user.id
      }, req);
      
      res.json({
        success: true,
        data: userWithoutPassword
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor' }
      });
    }
  }

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: { message: 'Senha atual e nova senha são obrigatórias' }
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: { message: 'Nova senha deve ter pelo menos 6 caracteres' }
        });
      }

      // Get current user with password
      const user = await database.get(
        'SELECT * FROM users WHERE id = ? AND active = 1',
        [req.user.id]
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          error: { message: 'Usuário não encontrado' }
        });
      }

      // Verify current password
      const validPassword = await bcrypt.compare(currentPassword, user.password);
      if (!validPassword) {
        return res.status(400).json({
          success: false,
          error: { message: 'Senha atual incorreta' }
        });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await database.run(
        'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [hashedNewPassword, req.user.id]
      );

      // Invalidate all refresh tokens for security
      await database.run(
        'DELETE FROM refresh_tokens WHERE user_id = ?',
        [req.user.id]
      );

      // Log password change
      await auditService.log(req.user.id, 'change_password', 'auth', {
        userId: req.user.id
      }, req);

      res.json({
        success: true,
        data: { message: 'Senha alterada com sucesso. Faça login novamente.' }
      });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor' }
      });
    }
  }

  async updateProfile(req, res) {
    try {
      const { name, email } = req.body;

      if (!name || !email) {
        return res.status(400).json({
          success: false,
          error: { message: 'Nome e email são obrigatórios' }
        });
      }

      // Check if email is already taken by another user
      const existingUser = await database.get(
        'SELECT * FROM users WHERE email = ? AND id != ?',
        [email, req.user.id]
      );

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: { message: 'Email já está sendo usado por outro usuário' }
        });
      }

      // Update user profile
      await database.run(
        'UPDATE users SET name = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name, email, req.user.id]
      );

      // Get updated user
      const updatedUser = await database.get(
        'SELECT id, email, name, role, plan, active, created_at, updated_at FROM users WHERE id = ?',
        [req.user.id]
      );

      // Log profile update
      await auditService.log(req.user.id, 'update_profile', 'auth', {
        changes: { name, email },
        oldEmail: req.user.email
      }, req);

      res.json({
        success: true,
        data: updatedUser
      });

    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor' }
      });
    }
  }
}

module.exports = new AuthController();