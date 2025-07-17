import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

// Generate a unique database for each test run
const testDatabaseName = `test_metalgest_${randomUUID().replace(/-/g, '_')}`;

export async function setupTestDatabase() {
  // Create test database
  const databaseUrl = process.env.DATABASE_URL?.replace(/\/\w+\?/, `/${testDatabaseName}?`) || 
    `postgresql://postgres:password@localhost:5432/${testDatabaseName}?schema=public`;
  
  process.env.DATABASE_URL = databaseUrl;
  
  try {
    // Run migrations
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    
    // Generate client
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    console.log(`✅ Test database created: ${testDatabaseName}`);
  } catch (error) {
    console.error('❌ Failed to setup test database:', error);
    throw error;
  }
}

export async function teardownTestDatabase() {
  try {
    await prisma.$disconnect();
    
    // Drop test database
    const { Client } = require('pg');
    const client = new Client({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'password',
      database: 'postgres',
    });
    
    await client.connect();
    await client.query(`DROP DATABASE IF EXISTS "${testDatabaseName}"`);
    await client.end();
    
    console.log(`✅ Test database dropped: ${testDatabaseName}`);
  } catch (error) {
    console.error('❌ Failed to teardown test database:', error);
  }
}

// Global test setup
beforeAll(async () => {
  await setupTestDatabase();
});

afterAll(async () => {
  await teardownTestDatabase();
});

export { prisma };