import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@metalgest.com' },
    update: {},
    create: {
      email: 'admin@metalgest.com',
      name: 'Administrator',
      password: adminPassword,
      role: 'ADMIN',
      emailVerified: true,
      active: true,
    },
  });

  console.log('✅ Admin user created:', adminUser.email);

  // Create demo user
  const demoPassword = await bcrypt.hash('demo123', 12);
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@metalgest.com' },
    update: {},
    create: {
      email: 'demo@metalgest.com',
      name: 'Demo User',
      password: demoPassword,
      role: 'USER',
      emailVerified: true,
      active: true,
    },
  });

  console.log('✅ Demo user created:', demoUser.email);

  // Create sample products
  const products = [
    {
      name: 'Chapa de Aço 1020',
      description: 'Chapa de aço carbono 1020 para estruturas',
      price: 25.50,
      category: 'Chapas',
      stock: 100,
      minStock: 10,
      sku: 'CHAPA-1020-001',
      weight: 7.85,
      dimensions: '1000x2000x3mm',
      userId: adminUser.id,
    },
    {
      name: 'Tubo Quadrado 50x50',
      description: 'Tubo quadrado de aço carbono 50x50mm',
      price: 18.75,
      category: 'Tubos',
      stock: 50,
      minStock: 5,
      sku: 'TUBO-QUAD-50',
      weight: 6.00,
      dimensions: '50x50x2mm',
      userId: adminUser.id,
    },
    {
      name: 'Perfil L 50x50',
      description: 'Perfil L de aço carbono 50x50mm',
      price: 15.20,
      category: 'Perfis',
      stock: 75,
      minStock: 8,
      sku: 'PERFIL-L-50',
      weight: 3.77,
      dimensions: '50x50x5mm',
      userId: adminUser.id,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: product,
    });
  }

  console.log('✅ Sample products created');

  // Create sample services
  const services = [
    {
      name: 'Corte a Laser',
      description: 'Serviço de corte a laser para chapas metálicas',
      price: 5.00,
      category: 'Corte',
      duration: 30,
      userId: adminUser.id,
    },
    {
      name: 'Soldagem MIG',
      description: 'Serviço de soldagem MIG para estruturas',
      price: 45.00,
      category: 'Soldagem',
      duration: 60,
      userId: adminUser.id,
    },
    {
      name: 'Dobra de Chapa',
      description: 'Serviço de dobra de chapas metálicas',
      price: 8.00,
      category: 'Conformação',
      duration: 20,
      userId: adminUser.id,
    },
  ];

  for (const service of services) {
    await prisma.service.create({
      data: service,
    });
  }

  console.log('✅ Sample services created');

  // Create sample client
  const client = await prisma.client.upsert({
    where: { document: '12.345.678/0001-90' },
    update: {},
    create: {
      personType: 'JURIDICA',
      name: 'Metalúrgica Exemplo Ltda',
      tradingName: 'Metalúrgica Exemplo',
      document: '12.345.678/0001-90',
      stateRegistration: '123456789',
      zipCode: '01234-567',
      street: 'Rua das Indústrias',
      number: '123',
      neighborhood: 'Distrito Industrial',
      city: 'São Paulo',
      state: 'SP',
      phone: '(11) 3333-4444',
      mobile: '(11) 99999-8888',
      email: 'contato@metalurgicaexemplo.com',
      contactName: 'João Silva',
      contactRole: 'Gerente de Compras',
      category: 'REGULAR',
      notes: 'Cliente com bom histórico de pagamentos',
      userId: adminUser.id,
    },
  });

  console.log('✅ Sample client created:', client.name);

  // Create user settings
  await prisma.setting.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      companyName: 'MetalGest Demo',
      companyDocument: '98.765.432/0001-10',
      companyPhone: '(11) 2222-3333',
      companyEmail: 'contato@metalgest.com',
      companyAddress: 'Av. Paulista, 1000 - São Paulo, SP',
      notificationSettings: {
        emailNotifications: true,
        quotesNotifications: true,
        lowStockNotifications: true,
      },
      systemSettings: {
        currency: 'BRL',
        language: 'pt-BR',
        timezone: 'America/Sao_Paulo',
      },
      quoteSettings: {
        validityDays: 30,
        showPrices: true,
        showCosts: false,
      },
    },
  });

  console.log('✅ User settings created');

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\nDemo credentials:');
  console.log('Admin: admin@metalgest.com / admin123');
  console.log('Demo: demo@metalgest.com / demo123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });