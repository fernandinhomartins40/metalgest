import {
  ClientCategory,
  ClientType,
  PlanType,
  PrismaClient,
  QuoteStatus,
  ServiceOrderPriority,
  ServiceOrderStatus,
  SubscriptionStatus,
  TransactionStatus,
  TransactionType,
  UserRole,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const testUsers = [
  {
    key: 'admin',
    email: 'admin@metalgest.com',
    password: 'admin123',
    name: 'Administrador',
    role: UserRole.ADMIN,
    plan: PlanType.ENTERPRISE,
    subscriptionStatus: SubscriptionStatus.ACTIVE,
    emailVerified: true,
    active: true,
  },
  {
    key: 'manager',
    email: 'user@metalgest.com',
    password: 'user123',
    name: 'Gestor Demo',
    role: UserRole.MANAGER,
    plan: PlanType.PREMIUM,
    subscriptionStatus: SubscriptionStatus.ACTIVE,
    emailVerified: true,
    active: true,
    phone: '+55 11 99999-9999',
  },
  {
    key: 'sales',
    email: 'comercial@metalgest.com',
    password: 'comercial123',
    name: 'Comercial Teste',
    role: UserRole.USER,
    plan: PlanType.PREMIUM,
    subscriptionStatus: SubscriptionStatus.ACTIVE,
    emailVerified: true,
    active: true,
    phone: '+55 11 97777-1111',
  },
  {
    key: 'finance',
    email: 'financeiro@metalgest.com',
    password: 'financeiro123',
    name: 'Financeiro Teste',
    role: UserRole.USER,
    plan: PlanType.PREMIUM,
    subscriptionStatus: SubscriptionStatus.ACTIVE,
    emailVerified: true,
    active: true,
    phone: '+55 11 96666-2222',
  },
  {
    key: 'operations',
    email: 'producao@metalgest.com',
    password: 'producao123',
    name: 'Producao Teste',
    role: UserRole.USER,
    plan: PlanType.BASIC,
    subscriptionStatus: SubscriptionStatus.ACTIVE,
    emailVerified: true,
    active: true,
    phone: '+55 11 95555-3333',
  },
] as const;

async function main() {
  console.log('Starting database seed...');

  await prisma.auditLog.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.serviceOrder.deleteMany();
  await prisma.quoteItem.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.service.deleteMany();
  await prisma.product.deleteMany();
  await prisma.client.deleteMany();
  await prisma.emailWebhookEvent.deleteMany();
  await prisma.outboundEmail.deleteMany();
  await prisma.authToken.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  const createdUsers = new Map<string, { id: string }>();

  for (const user of testUsers) {
    const hashedPassword = await bcrypt.hash(user.password, 12);
    const createdUser = await prisma.user.create({
      data: {
        email: user.email,
        password: hashedPassword,
        name: user.name,
        role: user.role,
        active: user.active,
        emailVerified: user.emailVerified,
        plan: user.plan,
        subscriptionStatus: user.subscriptionStatus,
        phone: user.phone,
      },
      select: {
        id: true,
      },
    });

    createdUsers.set(user.key, createdUser);
  }

  const manager = createdUsers.get('manager');
  if (!manager) {
    throw new Error('Manager test user was not created.');
  }

  const client1 = await prisma.client.create({
    data: {
      userId: manager.id,
      type: ClientType.BUSINESS,
      category: ClientCategory.REGULAR,
      name: 'Empresa ABC Ltda',
      tradeName: 'Empresa ABC',
      email: 'contato@empresaabc.com.br',
      phone: '+55 11 3456-7890',
      mobile: '+55 11 99876-5432',
      document: '12.345.678/0001-90',
      stateRegistration: '123456789',
      zipCode: '01310-100',
      street: 'Avenida Paulista',
      number: '1000',
      neighborhood: 'Bela Vista',
      city: 'Sao Paulo',
      state: 'SP',
      address: 'Avenida Paulista, 1000',
      contactName: 'Mariana Silva',
      contactRole: 'Compras',
      notes: 'Cliente prioritario',
    },
  });

  const client2 = await prisma.client.create({
    data: {
      userId: manager.id,
      type: ClientType.INDIVIDUAL,
      category: ClientCategory.VIP,
      name: 'Joao Pedro Lima',
      email: 'joao.lima@email.com',
      phone: '+55 21 2222-3333',
      mobile: '+55 21 99888-7777',
      document: '123.456.789-00',
      zipCode: '20040-020',
      street: 'Rua do Ouvidor',
      number: '50',
      neighborhood: 'Centro',
      city: 'Rio de Janeiro',
      state: 'RJ',
      address: 'Rua do Ouvidor, 50',
    },
  });

  const product1 = await prisma.product.create({
    data: {
      userId: manager.id,
      code: 'PROD-001',
      name: 'Porta de Aluminio 210x80',
      description: 'Porta de aluminio linha gold 210x80cm',
      category: 'Esquadrias',
      unit: 'un',
      costPrice: 350,
      salePrice: 550,
      stock: 15,
      minStock: 5,
      tags: ['novo'],
    },
  });

  const product2 = await prisma.product.create({
    data: {
      userId: manager.id,
      code: 'PROD-002',
      name: 'Janela de Aluminio 120x100',
      description: 'Janela de aluminio linha premium 120x100cm',
      category: 'Esquadrias',
      unit: 'un',
      costPrice: 280,
      salePrice: 450,
      stock: 8,
      minStock: 3,
    },
  });

  const service1 = await prisma.service.create({
    data: {
      userId: manager.id,
      code: 'SERV-001',
      name: 'Instalacao',
      description: 'Instalacao completa em obra',
      category: 'Instalacao',
      unit: 'h',
      costPrice: 50,
      salePrice: 120,
      estimatedDuration: 4,
      tags: ['destaque'],
    },
  });

  const quote1 = await prisma.quote.create({
    data: {
      userId: manager.id,
      clientId: client1.id,
      quoteNumber: 'ORC-2026-0001',
      description: 'Orcamento para substituicao de esquadrias',
      subtotal: 1760,
      discount: 60,
      tax: 0,
      totalValue: 1700,
      validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      status: QuoteStatus.PENDING,
      publicToken: 'public-demo-quote-1',
      publicLinkEnabled: true,
      notes: 'Pagamento em 30 dias',
      termsAndConditions: 'Prazo de entrega de 10 dias uteis.',
      items: {
        create: [
          {
            productId: product1.id,
            description: product1.name,
            quantity: 2,
            unitPrice: 550,
            totalPrice: 1100,
          },
          {
            serviceId: service1.id,
            description: service1.name,
            quantity: 5,
            unitPrice: 120,
            totalPrice: 600,
          },
        ],
      },
    },
    include: {
      items: true,
    },
  });

  await prisma.quote.create({
    data: {
      userId: manager.id,
      clientId: client2.id,
      quoteNumber: 'ORC-2026-0002',
      description: 'Orcamento aprovado para manutencao',
      subtotal: 450,
      discount: 0,
      tax: 0,
      totalValue: 450,
      validUntil: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      status: QuoteStatus.APPROVED,
      publicToken: 'public-demo-quote-2',
      publicLinkEnabled: false,
      items: {
        create: [
          {
            productId: product2.id,
            description: product2.name,
            quantity: 1,
            unitPrice: 450,
            totalPrice: 450,
          },
        ],
      },
    },
  });

  await prisma.serviceOrder.create({
    data: {
      userId: manager.id,
      clientId: client1.id,
      quoteId: quote1.id,
      orderNumber: 'OS-2026-0001',
      description: 'Instalacao das esquadrias do orcamento 1',
      priority: ServiceOrderPriority.HIGH,
      status: ServiceOrderStatus.IN_PROGRESS,
      startDate: new Date(),
      estimatedEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      notes: 'Equipe 1 responsavel',
    },
  });

  await prisma.transaction.createMany({
    data: [
      {
        userId: manager.id,
        type: TransactionType.INCOME,
        category: 'Receita de Vendas de Produtos',
        amount: 2300,
        description: 'Recebimento do cliente Empresa ABC',
        date: new Date(),
        paymentMethod: 'PIX',
        status: TransactionStatus.PAID,
      },
      {
        userId: manager.id,
        type: TransactionType.EXPENSE,
        category: 'CMV - Custo de Mercadoria Vendida',
        amount: 900,
        description: 'Compra de materia-prima',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        paymentMethod: 'Boleto',
        status: TransactionStatus.PAID,
      },
      {
        userId: manager.id,
        type: TransactionType.EXPENSE,
        category: 'Despesas com Pessoal',
        amount: 1500,
        description: 'Folha de pagamento',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        paymentMethod: 'Transferencia',
        status: TransactionStatus.PAID,
      },
    ],
  });

  await prisma.setting.createMany({
    data: [
      { userId: manager.id, key: 'company.name', value: 'MetalGest Esquadrias' },
      { userId: manager.id, key: 'company.taxId', value: '12.345.678/0001-90' },
      { userId: manager.id, key: 'company.phone', value: '+55 11 3456-7890' },
      { userId: manager.id, key: 'company.email', value: 'contato@metalgest.com' },
      { userId: manager.id, key: 'company.website', value: 'https://metalgest.local' },
      { userId: manager.id, key: 'company.address', value: 'Avenida Paulista, 1000' },
      { userId: manager.id, key: 'company.city', value: 'Sao Paulo' },
      { userId: manager.id, key: 'company.state', value: 'SP' },
      { userId: manager.id, key: 'company.zipCode', value: '01310-100' },
      { userId: manager.id, key: 'company.country', value: 'Brasil' },
      { userId: manager.id, key: 'system.timezone', value: 'America/Sao_Paulo' },
      { userId: manager.id, key: 'system.currency', value: 'BRL' },
      { userId: manager.id, key: 'notification.email', value: 'true' },
    ],
  });

  await prisma.auditLog.createMany({
    data: [
      {
        userId: manager.id,
        action: 'LOGIN',
        module: 'auth',
        details: { source: 'seed' },
      },
      {
        userId: manager.id,
        action: 'CREATE',
        module: 'quotes',
        details: { quoteNumber: quote1.quoteNumber },
      },
    ],
  });

  console.log('Seed completed successfully.');
  console.log('Test users created:');
  for (const user of testUsers) {
    console.log(`- ${user.email} / ${user.password}`);
  }
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
