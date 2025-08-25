const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const database = require('../config/database');

async function seed() {
  try {
    console.log('Starting database seeding...');
    
    // Connect to database
    await database.connect();

    // Create admin user
    const adminId = uuidv4();
    const adminPassword = await bcrypt.hash('admin123', 12);
    
    console.log('Creating admin user...');
    await database.run(`
      INSERT OR IGNORE INTO users (
        id, email, name, password, role, plan, active, email_verified, 
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [
      adminId, 
      'admin@metalgest.com', 
      'Administrator', 
      adminPassword, 
      'ADMIN', 
      'ENTERPRISE', 
      1, 
      1
    ]);

    // Create default settings for admin
    console.log('Creating default settings...');
    await database.run(`
      INSERT OR IGNORE INTO settings (
        id, user_id, company_name, created_at, updated_at
      ) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [uuidv4(), adminId, 'MetalGest - Empresa Demo']);

    // Create demo user
    const demoId = uuidv4();
    const demoPassword = await bcrypt.hash('demo123', 12);
    
    console.log('Creating demo user...');
    await database.run(`
      INSERT OR IGNORE INTO users (
        id, email, name, password, role, plan, active, email_verified,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [
      demoId, 
      'demo@metalgest.com', 
      'Usuário Demo', 
      demoPassword, 
      'USER', 
      'FREE', 
      1, 
      1
    ]);

    // Create settings for demo user
    await database.run(`
      INSERT OR IGNORE INTO settings (
        id, user_id, company_name, created_at, updated_at
      ) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [uuidv4(), demoId, 'Empresa Demo']);

    // Create sample clients for demo user
    console.log('Creating sample clients...');
    const clients = [
      {
        id: uuidv4(),
        name: 'João Silva',
        document: '12345678901',
        personType: 'FISICA',
        email: 'joao.silva@email.com',
        phone: '(11) 9999-1234',
        category: 'REGULAR'
      },
      {
        id: uuidv4(),
        name: 'Empresa ABC Ltda',
        document: '12.345.678/0001-90',
        personType: 'JURIDICA',
        tradingName: 'ABC Empresa',
        email: 'contato@empresaabc.com',
        phone: '(11) 3333-4567',
        category: 'VIP'
      },
      {
        id: uuidv4(),
        name: 'Maria Santos',
        document: '98765432100',
        personType: 'FISICA',
        email: 'maria.santos@email.com',
        phone: '(11) 8888-5678',
        category: 'POTENTIAL'
      }
    ];

    for (const client of clients) {
      await database.run(`
        INSERT OR IGNORE INTO clients (
          id, person_type, name, trading_name, document, email, phone, 
          category, user_id, active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [
        client.id,
        client.personType,
        client.name,
        client.tradingName || null,
        client.document,
        client.email,
        client.phone,
        client.category,
        demoId
      ]);
    }

    // Create sample products for demo user
    console.log('Creating sample products...');
    const products = [
      {
        id: uuidv4(),
        name: 'Chapa de Aço 1mm',
        description: 'Chapa de aço carbono espessura 1mm',
        price: 150.00,
        category: 'Chapas',
        stock: 50,
        minStock: 10
      },
      {
        id: uuidv4(),
        name: 'Perfil U 100mm',
        description: 'Perfil U de aço 100mm',
        price: 75.50,
        category: 'Perfis',
        stock: 25,
        minStock: 5
      },
      {
        id: uuidv4(),
        name: 'Tubo Redondo 2"',
        description: 'Tubo redondo de aço 2 polegadas',
        price: 120.00,
        category: 'Tubos',
        stock: 30,
        minStock: 8
      }
    ];

    for (const product of products) {
      await database.run(`
        INSERT OR IGNORE INTO products (
          id, name, description, price, category, stock, min_stock,
          user_id, active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [
        product.id,
        product.name,
        product.description,
        product.price,
        product.category,
        product.stock,
        product.minStock,
        demoId
      ]);
    }

    // Create sample services for demo user
    console.log('Creating sample services...');
    const services = [
      {
        id: uuidv4(),
        name: 'Corte a Laser',
        description: 'Corte de peças em equipamento laser',
        price: 25.00,
        category: 'Corte',
        duration: 30
      },
      {
        id: uuidv4(),
        name: 'Soldagem MIG',
        description: 'Soldagem de peças processo MIG',
        price: 80.00,
        category: 'Soldagem',
        duration: 60
      },
      {
        id: uuidv4(),
        name: 'Dobra de Chapa',
        description: 'Dobra de chapas em prensa hidráulica',
        price: 35.00,
        category: 'Conformação',
        duration: 45
      }
    ];

    for (const service of services) {
      await database.run(`
        INSERT OR IGNORE INTO services (
          id, name, description, price, category, duration,
          user_id, active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [
        service.id,
        service.name,
        service.description,
        service.price,
        service.category,
        service.duration,
        demoId
      ]);
    }

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📋 Created accounts:');
    console.log('👤 Admin: admin@metalgest.com / admin123');
    console.log('👤 Demo: demo@metalgest.com / demo123');
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  } finally {
    await database.close();
  }
}

// Run seeding if called directly
if (require.main === module) {
  seed();
}

module.exports = seed;