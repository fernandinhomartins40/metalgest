#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 Setting up MetalGest Monorepo...");

// Install dependencies in root
console.log("📦 Installing root dependencies...");
execSync("npm install", { stdio: "inherit", cwd: __dirname });

// Install dependencies in packages
console.log("📦 Installing packages dependencies...");
execSync("npm install", { stdio: "inherit", cwd: path.join(__dirname, "packages", "shared") });
execSync("npm install", { stdio: "inherit", cwd: path.join(__dirname, "packages", "database") });

// Install dependencies in apps
console.log("📦 Installing apps dependencies...");
execSync("npm install", { stdio: "inherit", cwd: path.join(__dirname, "apps", "web") });
execSync("npm install", { stdio: "inherit", cwd: path.join(__dirname, "apps", "server") });

// Generate Prisma client
console.log("🔄 Generating Prisma client...");
execSync("npx prisma generate", { stdio: "inherit", cwd: path.join(__dirname, "packages", "database") });

// Create example env files if they don't exist
const serverEnvPath = path.join(__dirname, "apps", "server", ".env");
const webEnvPath = path.join(__dirname, "apps", "web", ".env");

if (!fs.existsSync(serverEnvPath)) {
  console.log("📝 Creating server .env file...");
  fs.copyFileSync(
    path.join(__dirname, "apps", "server", ".env.example"),
    serverEnvPath
  );
}

console.log("✅ Setup complete!");
console.log("\nNext steps:");
console.log("1. Update database URL in apps/server/.env");
console.log("2. Run migrations: npm run db:migrate");
console.log("3. Start development: npm run dev");