#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up MetalGest Backend...\n');

// Check if .env exists
if (!fs.existsSync('.env')) {
  console.log('📄 Creating .env file...');
  fs.copyFileSync('.env.example', '.env');
  console.log('✅ .env file created. Please update with your configuration.\n');
} else {
  console.log('✅ .env file already exists.\n');
}

// Create directories
const directories = [
  'logs',
  'uploads',
  'uploads/logos',
  'uploads/documents',
  'uploads/temp'
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

console.log('\n🔧 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully.\n');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

console.log('🗄️ Setting up database...');
try {
  console.log('Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated.\n');
} catch (error) {
  console.error('❌ Failed to generate Prisma client:', error.message);
  console.log('Please make sure your DATABASE_URL is correctly set in .env file.\n');
}

console.log('🎉 Setup complete!\n');
console.log('Next steps:');
console.log('1. Update your .env file with correct database credentials');
console.log('2. Run database migrations: npm run prisma:migrate');
console.log('3. Start development server: npm run dev');
console.log('\nFor production deployment, run: npm run build && npm start');