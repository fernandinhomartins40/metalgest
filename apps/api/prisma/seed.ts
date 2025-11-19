import { PrismaClient, UserRole, ClientType, TransactionType, TransactionCategory } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean database
  console.log('🧹 Cleaning database...');
  await prisma.quoteItem.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.serviceOrder.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.product.deleteMany();
  await prisma.service.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  console.log('👤 Creating admin user...');
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@metalgest.com',
      password: adminPassword,
      name: 'Administrador',
      role: UserRole.ADMIN,
      active: true,
      emailVerified: true,
    },
  });

  // Create regular user
  console.log('👤 Creating regular user...');
  const userPassword = await bcrypt.hash('user123', 12);
  const user = await prisma.user.create({
    data: {
      email: 'user@metalgest.com',
      password: userPassword,
      name: 'Usuário Demo',
      role: UserRole.USER,
      active: true,
      emailVerified: true,
    },
  });

  // Create clients
  console.log('👥 Creating clients...');
  const client1 = await prisma.client.create({
    data: {
      userId: user.id,
      type: ClientType.INDIVIDUAL,
      name: 'João Silva',
      email: 'joao.silva@email.com',
      phone: '(11) 98765-4321',
      document: '123.456.789-00',
      address: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      country: 'Brasil',
    },
  });

  const client2 = await prisma.client.create({
    data: {
      userId: user.id,
      type: ClientType.COMPANY,
      name: 'Empresa ABC Ltda',
      email: 'contato@empresaabc.com.br',
      phone: '(11) 3456-7890',
      document: '12.345.678/0001-90',
      address: 'Av. Paulista, 1000',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
      country: 'Brasil',
    },
  });

  const client3 = await prisma.client.create({
    data: {
      userId: user.id,
      type: ClientType.INDIVIDUAL,
      name: 'Maria Santos',
      email: 'maria.santos@email.com',
      phone: '(21) 99876-5432',
      address: 'Rua do Ouvidor, 50',
      city: 'Rio de Janeiro',
      state: 'RJ',
      zipCode: '20040-030',
      country: 'Brasil',
    },
  });

  // Create products
  console.log('📦 Creating products...');
  const product1 = await prisma.product.create({
    data: {
      userId: user.id,
      code: 'PROD001',
      name: 'Porta de Alumínio 210x80',
      description: 'Porta de alumínio linha gold 210x80cm',
      category: 'Portas',
      unit: 'un',
      costPrice: 350.00,
      salePrice: 550.00,
      stock: 15,
      minStock: 5,
    },
  });

  const product2 = await prisma.product.create({
    data: {
      userId: user.id,
      code: 'PROD002',
      name: 'Janela de Alumínio 120x100',
      description: 'Janela de alumínio linha premium 120x100cm',
      category: 'Janelas',
      unit: 'un',
      costPrice: 280.00,
      salePrice: 450.00,
      stock: 8,
      minStock: 3,
    },
  });

  const product3 = await prisma.product.create({
    data: {
      userId: user.id,
      code: 'PROD003',
      name: 'Vidro Temperado 8mm',
      description: 'Vidro temperado 8mm - preço por m²',
      category: 'Vidros',
      unit: 'm²',
      costPrice: 120.00,
      salePrice: 200.00,
      stock: 50,
      minStock: 20,
    },
  });

  // Create services
  console.log('🛠️  Creating services...');
  const service1 = await prisma.service.create({
    data: {
      userId: user.id,
      code: 'SERV001',
      name: 'Instalação de Porta',
      description: 'Serviço de instalação de porta de alumínio',
      category: 'Instalação',
      unit: 'h',
      costPrice: 50.00,
      salePrice: 120.00,
      estimatedDuration: 4,
    },
  });

  const service2 = await prisma.service.create({
    data: {
      userId: user.id,
      code: 'SERV002',
      name: 'Manutenção Preventiva',
      description: 'Serviço de manutenção preventiva em esquadrias',
      category: 'Manutenção',
      unit: 'h',
      costPrice: 40.00,
      salePrice: 90.00,
      estimatedDuration: 2,
    },
  });

  // Create quotes
  console.log('📋 Creating quotes...');
  await prisma.quote.create({
    data: {
      userId: user.id,
      clientId: client1.id,
      quoteNumber: 'ORC-2025-0001',
      subtotal: 1100.00,
      discount: 50.00,
      tax: 0,
      totalValue: 1050.00,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      status: 'PENDING',
      publicToken: 'demo-token-1',
      publicLinkEnabled: true,
      notes: 'Orçamento para reforma residencial',
      items: {
        create: [
          {
            productId: product1.id,
            description: 'Porta de Alumínio 210x80',
            quantity: 2,
            unitPrice: 550.00,
            totalPrice: 1100.00,
          },
        ],
      },
    },
  });

  await prisma.quote.create({
    data: {
      userId: user.id,
      clientId: client2.id,
      quoteNumber: 'ORC-2025-0002',
      subtotal: 2300.00,
      discount: 0,
      tax: 0,
      totalValue: 2300.00,
      validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
      status: 'ACCEPTED',
      publicToken: 'demo-token-2',
      publicLinkEnabled: false,
      notes: 'Orçamento aceito - iniciar produção',
      items: {
        create: [
          {
            productId: product2.id,
            description: 'Janela de Alumínio 120x100',
            quantity: 3,
            unitPrice: 450.00,
            totalPrice: 1350.00,
          },
          {
            productId: product3.id,
            description: 'Vidro Temperado 8mm',
            quantity: 10,
            unitPrice: 200.00,
            totalPrice: 2000.00,
          },
          {
            serviceId: service1.id,
            description: 'Instalação de Janelas',
            quantity: 3,
            unitPrice: 120.00,
            totalPrice: 360.00,
          },
        ],
      },
    },
  });

  // Create service orders
  console.log('📝 Creating service orders...');
  await prisma.serviceOrder.create({
    data: {
      userId: user.id,
      clientId: client2.id,
      orderNumber: 'OS-2025-0001',
      description: 'Instalação de janelas e aplicação de vidros',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      startDate: new Date(),
      estimatedEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  await prisma.serviceOrder.create({
    data: {
      userId: user.id,
      clientId: client3.id,
      orderNumber: 'OS-2025-0002',
      description: 'Manutenção preventiva em portas e janelas',
      priority: 'MEDIUM',
      status: 'PENDING',
      estimatedEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
    },
  });

  // Create transactions
  console.log('💰 Creating transactions...');
  await prisma.transaction.create({
    data: {
      userId: user.id,
      type: TransactionType.INCOME,
      category: TransactionCategory.SALES,
      amount: 2300.00,
      description: 'Venda - Empresa ABC Ltda - ORC-2025-0002',
      date: new Date(),
      paymentMethod: 'Transferência Bancária',
    },
  });

  await prisma.transaction.create({
    data: {
      userId: user.id,
      type: TransactionType.EXPENSE,
      category: TransactionCategory.SUPPLIERS,
      amount: 1500.00,
      description: 'Compra de matéria-prima - Alumínio',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      paymentMethod: 'Boleto',
    },
  });

  await prisma.transaction.create({
    data: {
      userId: user.id,
      type: TransactionType.EXPENSE,
      category: TransactionCategory.SALARIES,
      amount: 3500.00,
      description: 'Pagamento de salário - Funcionário',
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      paymentMethod: 'Transferência Bancária',
    },
  });

  // Create settings
  console.log('⚙️  Creating settings...');
  await prisma.setting.createMany({
    data: [
      { userId: user.id, key: 'company.name', value: 'MetalGest Esquadrias' },
      { userId: user.id, key: 'company.email', value: 'contato@metalgest.com' },
      { userId: user.id, key: 'company.phone', value: '(11) 3456-7890' },
      { userId: user.id, key: 'company.address', value: 'Rua Exemplo, 123' },
      { userId: user.id, key: 'company.city', value: 'São Paulo' },
      { userId: user.id, key: 'company.state', value: 'SP' },
      { userId: user.id, key: 'company.zipCode', value: '01234-567' },
      { userId: user.id, key: 'company.country', value: 'Brasil' },
      { userId: user.id, key: 'company.taxId', value: '12.345.678/0001-90' },
    ],
  });

  console.log('✅ Database seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log('  - Users: 2 (admin@metalgest.com / user@metalgest.com)');
  console.log('  - Clients: 3');
  console.log('  - Products: 3');
  console.log('  - Services: 2');
  console.log('  - Quotes: 2');
  console.log('  - Service Orders: 2');
  console.log('  - Transactions: 3');
  console.log('  - Settings: 9');
  console.log('\n🔑 Credentials:');
  console.log('  Admin: admin@metalgest.com / admin123');
  console.log('  User: user@metalgest.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
