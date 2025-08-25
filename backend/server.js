require('dotenv').config();
const createApp = require('./src/config/app');
const database = require('./src/config/database');

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

async function startServer() {
  try {
    console.log(`🚀 Starting MetalGest Backend Server...`);
    console.log(`📊 Environment: ${NODE_ENV}`);
    
    // Initialize database
    console.log('🗄️  Connecting to SQLite database...');
    await database.connect();
    console.log('✅ Database connected successfully');
    
    // Create Express app
    const app = createApp();
    
    // Start server
    const server = app.listen(PORT, () => {
      console.log('🎯 Backend server running successfully!');
      console.log('');
      console.log('📍 Server Details:');
      console.log(`   • Port: ${PORT}`);
      console.log(`   • Environment: ${NODE_ENV}`);
      console.log(`   • Base URL: http://localhost:${PORT}`);
      console.log(`   • API URL: http://localhost:${PORT}/api`);
      console.log(`   • Health Check: http://localhost:${PORT}/api/health`);
      console.log('');
      console.log('🔗 Available Endpoints:');
      console.log('   • POST   /api/auth/login');
      console.log('   • POST   /api/auth/register');
      console.log('   • POST   /api/auth/refresh');
      console.log('   • POST   /api/auth/logout');
      console.log('   • GET    /api/auth/me');
      console.log('   • GET    /api/clients');
      console.log('   • POST   /api/clients');
      console.log('   • GET    /api/products');
      console.log('   • POST   /api/products');
      console.log('   • GET    /api/services');
      console.log('   • POST   /api/services');
      console.log('   • GET    /api/quotes');
      console.log('   • POST   /api/quotes');
      console.log('   • GET    /api/dashboard/stats');
      console.log('   • GET    /api/users');
      console.log('   • GET    /api/transactions');
      console.log('   • POST   /api/upload/single');
      console.log('');
      console.log('💡 Ready to receive requests!');
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
      
      server.close(async () => {
        console.log('🔌 HTTP server closed');
        
        try {
          await database.close();
          console.log('🗄️  Database connection closed');
          console.log('✅ Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });
      
      // Force close server after 10 seconds
      setTimeout(() => {
        console.error('⏰ Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('💥 Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('unhandledRejection');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();