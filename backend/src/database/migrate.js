const fs = require('fs');
const path = require('path');
const database = require('../config/database');

async function migrate() {
  try {
    console.log('Starting database migration...');
    
    // Connect to database
    await database.connect();
    
    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    // Execute each statement
    for (const statement of statements) {
      console.log('Executing:', statement.substring(0, 50) + '...');
      await database.run(statement);
    }
    
    console.log('Database migration completed successfully!');
    
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  } finally {
    await database.close();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrate();
}

module.exports = migrate;