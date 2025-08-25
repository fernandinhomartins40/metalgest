# Plano Completo: Backend Node.js + SQLite3 para MetalGest

## Visão Geral

Este plano detalha a implementação de um backend Node.js independente com SQLite3, substituindo o atual sistema Next.js + tRPC + PostgreSQL por uma solução mais simples e autônoma, mantendo 100% da compatibilidade com o frontend existente.

---

# PARTE 1: PREPARAÇÃO E ESTRUTURA BASE

## 1.1 Estrutura do Novo Backend

### Estrutura de Diretórios
```
backend/
├── src/
│   ├── config/           # Configurações
│   │   ├── database.js   # Configuração SQLite
│   │   ├── auth.js       # Config autenticação
│   │   └── app.js        # Config Express
│   ├── controllers/      # Controllers REST
│   │   ├── auth.js
│   │   ├── clients.js
│   │   ├── products.js
│   │   ├── services.js
│   │   ├── quotes.js
│   │   ├── dashboard.js
│   │   └── users.js
│   ├── middleware/       # Middlewares
│   │   ├── auth.js       # Autenticação JWT
│   │   ├── validation.js # Validação Zod
│   │   ├── audit.js      # Logs de auditoria
│   │   └── cors.js       # CORS config
│   ├── models/           # Modelos SQLite
│   │   ├── User.js
│   │   ├── Client.js
│   │   ├── Product.js
│   │   ├── Service.js
│   │   ├── Quote.js
│   │   └── Transaction.js
│   ├── routes/           # Rotas REST API
│   │   ├── auth.js
│   │   ├── clients.js
│   │   ├── products.js
│   │   ├── services.js
│   │   ├── quotes.js
│   │   ├── dashboard.js
│   │   └── users.js
│   ├── services/         # Lógica de negócio
│   │   ├── auth.service.js
│   │   ├── clients.service.js
│   │   ├── products.service.js
│   │   └── audit.service.js
│   ├── utils/            # Utilitários
│   │   ├── encryption.js # Bcrypt, JWT
│   │   ├── validation.js # Esquemas Zod
│   │   └── helpers.js    # Funções auxiliares
│   └── database/         # Banco de dados
│       ├── sqlite.db     # Arquivo SQLite
│       ├── migrations/   # Migrações
│       └── seeds/        # Dados iniciais
├── uploads/              # Upload de arquivos
├── logs/                 # Logs da aplicação
├── tests/                # Testes
├── package.json
├── .env.example
└── server.js            # Entry point
```

## 1.2 Dependências Necessárias

### package.json
```json
{
  "name": "metalgest-backend",
  "version": "1.0.0",
  "description": "Backend Node.js para MetalGest",
  "main": "server.js",
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js",
    "migrate": "node src/database/migrate.js",
    "seed": "node src/database/seed.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2",
    "sqlite3": "^5.1.6",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.22.4",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "morgan": "^1.10.0",
    "multer": "^1.4.5",
    "dotenv": "^16.3.1",
    "winston": "^3.10.0",
    "compression": "^1.7.4",
    "rate-limiting": "^1.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.7.0",
    "supertest": "^6.3.3"
  }
}
```

## 1.3 Configurações Base

### .env
```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_PATH=./src/database/sqlite.db

# JWT
JWT_SECRET=metalgest-jwt-secret-key
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=metalgest-refresh-secret
REFRESH_TOKEN_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:3001

# Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5000000

# Logs
LOG_LEVEL=info
LOG_FILE=./logs/app.log
```

---

# PARTE 2: IMPLEMENTAÇÃO DO CORE

## 2.1 Configuração do Banco SQLite

### src/config/database.js
```javascript
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.db = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      const dbPath = process.env.DATABASE_PATH || './src/database/sqlite.db';
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          this.enableForeignKeys();
          resolve(this.db);
        }
      });
    });
  }

  enableForeignKeys() {
    this.db.run("PRAGMA foreign_keys = ON");
  }

  close() {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close(() => {
          console.log('Database connection closed');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

module.exports = new Database();
```

## 2.2 Schema SQLite (Migração do Prisma)

### src/database/schema.sql
```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'USER',
    active BOOLEAN DEFAULT 1,
    email_verified BOOLEAN DEFAULT 0,
    email_verification_token TEXT,
    password_reset_token TEXT,
    password_reset_expires DATETIME,
    plan TEXT DEFAULT 'FREE',
    subscription_id TEXT,
    subscription_status TEXT,
    subscription_expires_at DATETIME,
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Refresh tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id TEXT PRIMARY KEY,
    token TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Products
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL,
    stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 0,
    sku TEXT,
    barcode TEXT,
    weight DECIMAL(8,3),
    dimensions TEXT,
    active BOOLEAN DEFAULT 1,
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Services
CREATE TABLE IF NOT EXISTS services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL,
    duration INTEGER,
    active BOOLEAN DEFAULT 1,
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Clients
CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    person_type TEXT DEFAULT 'FISICA',
    name TEXT NOT NULL,
    trading_name TEXT,
    document TEXT NOT NULL,
    state_registration TEXT,
    municipal_registration TEXT,
    zip_code TEXT,
    street TEXT,
    number TEXT,
    complement TEXT,
    neighborhood TEXT,
    city TEXT,
    state TEXT,
    phone TEXT,
    mobile TEXT,
    email TEXT,
    contact_name TEXT,
    contact_role TEXT,
    category TEXT DEFAULT 'REGULAR',
    notes TEXT,
    active BOOLEAN DEFAULT 1,
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Quotes
CREATE TABLE IF NOT EXISTS quotes (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    description TEXT NOT NULL,
    total_value DECIMAL(10,2) NOT NULL,
    profit_percentage DECIMAL(5,2) DEFAULT 0,
    status TEXT DEFAULT 'DRAFT',
    tags TEXT, -- JSON array as string
    public_token TEXT UNIQUE,
    public_link_expires_at DATETIME,
    notes TEXT,
    valid_until DATETIME,
    terms TEXT,
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Quote Items
CREATE TABLE IF NOT EXISTS quote_items (
    id TEXT PRIMARY KEY,
    quote_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    discount DECIMAL(5,2) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Service Items
CREATE TABLE IF NOT EXISTS service_items (
    id TEXT PRIMARY KEY,
    quote_id TEXT NOT NULL,
    service_id TEXT NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    discount DECIMAL(5,2) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- Service Orders
CREATE TABLE IF NOT EXISTS service_orders (
    id TEXT PRIMARY KEY,
    quote_id TEXT UNIQUE NOT NULL,
    client_id TEXT NOT NULL,
    responsible_id TEXT NOT NULL,
    status TEXT DEFAULT 'WAITING',
    priority TEXT DEFAULT 'MEDIUM',
    deadline DATETIME,
    start_date DATETIME,
    end_date DATETIME,
    notes TEXT,
    tags TEXT, -- JSON array as string
    estimated_hours INTEGER,
    actual_hours INTEGER,
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    category TEXT NOT NULL,
    date DATETIME NOT NULL,
    due_date DATETIME,
    paid_at DATETIME,
    status TEXT DEFAULT 'PENDING',
    notes TEXT,
    tags TEXT, -- JSON array as string
    reference_id TEXT,
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Settings
CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    company_name TEXT,
    company_document TEXT,
    company_phone TEXT,
    company_email TEXT,
    company_address TEXT,
    company_logo TEXT,
    notification_settings TEXT, -- JSON as string
    system_settings TEXT, -- JSON as string
    quote_settings TEXT, -- JSON as string
    invoice_settings TEXT, -- JSON as string
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    module TEXT NOT NULL,
    details TEXT, -- JSON as string
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_services_user_id ON services(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_quotes_user_id ON quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_quotes_client_id ON quotes(client_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
```

## 2.3 Middleware de Autenticação

### src/middleware/auth.js
```javascript
const jwt = require('jsonwebtoken');
const database = require('../config/database');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: { message: 'Access denied. No token provided.' } 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await database.get(
      'SELECT * FROM users WHERE id = ? AND active = 1', 
      [decoded.id]
    );

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: { message: 'Invalid token.' } 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      error: { message: 'Invalid token.' } 
    });
  }
};

module.exports = authMiddleware;
```

---

# PARTE 3: IMPLEMENTAÇÃO COMPLETA DOS ENDPOINTS

## 3.1 Controller de Autenticação

### src/controllers/auth.js
```javascript
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const database = require('../config/database');
const { loginSchema, registerSchema } = require('../utils/validation');

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
      const hashedPassword = await bcrypt.hash(password, 10);
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
        expiresIn: process.env.JWT_EXPIRES_IN
      });

      const refreshToken = jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
      });

      // Store refresh token
      await database.run(`
        INSERT INTO refresh_tokens (id, token, user_id, expires_at)
        VALUES (?, ?, ?, datetime('now', '+7 days'))
      `, [uuidv4(), refreshToken, userId]);

      const user = await database.get(
        'SELECT id, email, name, role, plan FROM users WHERE id = ?',
        [userId]
      );

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
        expiresIn: process.env.JWT_EXPIRES_IN
      });

      const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
      });

      // Store refresh token
      await database.run(`
        INSERT INTO refresh_tokens (id, token, user_id, expires_at)
        VALUES (?, ?, ?, datetime('now', '+7 days'))
      `, [uuidv4(), refreshToken, user.id]);

      const { password: _, ...userWithoutPassword } = user;

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
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          error: { message: 'Refresh token necessário' }
        });
      }

      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      
      // Check if refresh token exists in database
      const storedToken = await database.get(
        'SELECT * FROM refresh_tokens WHERE token = ? AND user_id = ? AND expires_at > datetime()',
        [refreshToken, decoded.id]
      );

      if (!storedToken) {
        return res.status(401).json({
          success: false,
          error: { message: 'Refresh token inválido' }
        });
      }

      // Generate new access token
      const newToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
      });

      res.json({
        success: true,
        data: { token: newToken }
      });

    } catch (error) {
      res.status(401).json({
        success: false,
        error: { message: 'Refresh token inválido' }
      });
    }
  }

  async logout(req, res) {
    try {
      const { refreshToken } = req.body;
      
      if (refreshToken) {
        // Remove refresh token from database
        await database.run(
          'DELETE FROM refresh_tokens WHERE token = ?',
          [refreshToken]
        );
      }

      res.json({
        success: true,
        data: { message: 'Logout realizado com sucesso' }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor' }
      });
    }
  }

  async me(req, res) {
    try {
      const { password, ...userWithoutPassword } = req.user;
      
      res.json({
        success: true,
        data: userWithoutPassword
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: { message: 'Erro interno do servidor' }
      });
    }
  }
}

module.exports = new AuthController();
```

## 3.2 Controller de Clientes (Exemplo Completo)

### src/controllers/clients.js
```javascript
const { v4: uuidv4 } = require('uuid');
const database = require('../config/database');
const { clientSchema } = require('../utils/validation');
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

      await auditService.log(req.user.id, 'list', 'clients', {
        count: clients.length,
        params: req.query
      });

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

      await auditService.log(req.user.id, 'get', 'clients', { clientId: id });

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
        validatedData.tradingName,
        validatedData.document,
        validatedData.stateRegistration,
        validatedData.municipalRegistration,
        validatedData.zipCode,
        validatedData.street,
        validatedData.number,
        validatedData.complement,
        validatedData.neighborhood,
        validatedData.city,
        validatedData.state,
        validatedData.phone,
        validatedData.mobile,
        validatedData.email,
        validatedData.contactName,
        validatedData.contactRole,
        validatedData.category || 'REGULAR',
        validatedData.notes,
        req.user.id
      ]);

      const client = await database.get(
        'SELECT * FROM clients WHERE id = ?',
        [clientId]
      );

      await auditService.log(req.user.id, 'create', 'clients', {
        clientId,
        clientName: client.name
      });

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
        validatedData.tradingName,
        validatedData.document,
        validatedData.stateRegistration,
        validatedData.municipalRegistration,
        validatedData.zipCode,
        validatedData.street,
        validatedData.number,
        validatedData.complement,
        validatedData.neighborhood,
        validatedData.city,
        validatedData.state,
        validatedData.phone,
        validatedData.mobile,
        validatedData.email,
        validatedData.contactName,
        validatedData.contactRole,
        validatedData.category || existingClient.category,
        validatedData.notes,
        id
      ]);

      const updatedClient = await database.get(
        'SELECT * FROM clients WHERE id = ?',
        [id]
      );

      await auditService.log(req.user.id, 'update', 'clients', {
        clientId: id,
        changes: validatedData
      });

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

      // Soft delete
      await database.run(
        'UPDATE clients SET active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
      );

      await auditService.log(req.user.id, 'delete', 'clients', {
        clientId: id,
        clientName: client.name
      });

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
        SELECT id, name, document, email, phone 
        FROM clients 
        WHERE user_id = ? AND active = 1 
        AND (name LIKE ? OR document LIKE ? OR email LIKE ?)
        ORDER BY name ASC
        LIMIT ?
      `, [req.user.id, `%${query}%`, `%${query}%`, `%${query}%`, parseInt(limit)]);

      await auditService.log(req.user.id, 'search', 'clients', {
        query,
        count: clients.length
      });

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
}

module.exports = new ClientsController();
```

## 3.3 Serviço de Auditoria

### src/services/audit.service.js
```javascript
const { v4: uuidv4 } = require('uuid');
const database = require('../config/database');

class AuditService {
  async log(userId, action, module, details = null, req = null) {
    try {
      const auditId = uuidv4();
      const ipAddress = req?.ip || req?.connection?.remoteAddress;
      const userAgent = req?.get('User-Agent');

      await database.run(`
        INSERT INTO audit_logs (
          id, user_id, action, module, details, ip_address, user_agent, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [
        auditId,
        userId,
        action,
        module,
        details ? JSON.stringify(details) : null,
        ipAddress,
        userAgent
      ]);

      return auditId;
    } catch (error) {
      console.error('Audit log error:', error);
      // Don't throw error to avoid breaking main functionality
    }
  }

  async getLogs(userId, filters = {}) {
    try {
      const { page = 1, limit = 50, module, action, startDate, endDate } = filters;
      const offset = (page - 1) * limit;

      let query = 'SELECT * FROM audit_logs WHERE user_id = ?';
      const params = [userId];

      if (module) {
        query += ' AND module = ?';
        params.push(module);
      }

      if (action) {
        query += ' AND action = ?';
        params.push(action);
      }

      if (startDate) {
        query += ' AND created_at >= ?';
        params.push(startDate);
      }

      if (endDate) {
        query += ' AND created_at <= ?';
        params.push(endDate);
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), offset);

      const logs = await database.all(query, params);

      // Parse JSON details
      const parsedLogs = logs.map(log => ({
        ...log,
        details: log.details ? JSON.parse(log.details) : null
      }));

      return parsedLogs;
    } catch (error) {
      console.error('Get audit logs error:', error);
      throw error;
    }
  }
}

module.exports = new AuditService();
```

---

**Resumo da Parte 1**: Estabelecemos a estrutura base, configurações do SQLite, sistema de autenticação JWT, middleware de segurança e implementamos completamente os controllers de autenticação e clientes como exemplo.

**Próximos passos**: Na Parte 2 implementaremos todos os demais controllers (Products, Services, Quotes, Dashboard, etc.) e na Parte 3 faremos a integração completa com o frontend, testes e deploy.

Este plano garante 100% de compatibilidade com o frontend existente, mantendo a mesma estrutura de resposta das APIs e todas as funcionalidades atuais.