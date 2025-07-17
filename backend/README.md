# MetalGest Backend API

A robust Node.js backend API for the MetalGest application, built with Express.js, TypeScript, and PostgreSQL.

## Features

- 🔐 **Authentication & Authorization**: JWT-based authentication with refresh tokens
- 🗄️ **Database**: PostgreSQL with Prisma ORM
- 🛡️ **Security**: Helmet, CORS, rate limiting, and input validation
- 📊 **Logging**: Winston with daily rotation
- 🔄 **Error Handling**: Centralized error handling with custom error classes
- 📈 **Monitoring**: Health checks and audit logging
- 📱 **API Documentation**: RESTful API design with consistent responses
- 🚀 **Performance**: Compression, caching, and optimized queries

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **Logging**: Winston
- **Validation**: Joi
- **Security**: Helmet, CORS, bcrypt

## Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Express middleware
├── routes/          # API routes
├── services/        # Business logic
├── types/           # TypeScript types
├── utils/           # Utility functions
├── app.ts           # Express app setup
└── index.ts         # Server entry point
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- PostgreSQL 13 or higher
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration values.

4. Set up the database:
   ```bash
   # Generate Prisma client
   npm run prisma:generate
   
   # Run migrations
   npm run prisma:migrate
   
   # Optional: Seed the database
   npm run prisma:seed
   ```

### Development

Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

### Production

Build and start the production server:
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user

### Products
- `GET /api/v1/products` - List products
- `POST /api/v1/products` - Create product
- `GET /api/v1/products/:id` - Get product
- `PUT /api/v1/products/:id` - Update product
- `DELETE /api/v1/products/:id` - Delete product

### Clients
- `GET /api/v1/clients` - List clients
- `POST /api/v1/clients` - Create client
- `GET /api/v1/clients/:id` - Get client
- `PUT /api/v1/clients/:id` - Update client
- `DELETE /api/v1/clients/:id` - Delete client

### Quotes
- `GET /api/v1/quotes` - List quotes
- `POST /api/v1/quotes` - Create quote
- `GET /api/v1/quotes/:id` - Get quote
- `PUT /api/v1/quotes/:id` - Update quote
- `DELETE /api/v1/quotes/:id` - Delete quote
- `GET /api/v1/quotes/public/:token` - Get public quote

### Dashboard
- `GET /api/v1/dashboard/stats` - Get dashboard statistics
- `GET /api/v1/dashboard/charts` - Get chart data

### Health Check
- `GET /health` - Basic health check
- `GET /api/v1/health/detailed` - Detailed health check

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | JWT secret key | Required |
| `JWT_REFRESH_SECRET` | JWT refresh secret key | Required |
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment | development |
| `CORS_ORIGIN` | CORS allowed origin | http://localhost:5173 |

## Database Schema

The application uses the following main entities:

- **Users**: User accounts and authentication
- **Products**: Product catalog management
- **Services**: Service offerings
- **Clients**: Customer management
- **Quotes**: Quote generation and management
- **Transactions**: Financial transactions
- **Service Orders**: Production management
- **Settings**: Application configuration
- **Audit Logs**: System activity tracking

## Security Features

- **Authentication**: JWT tokens with refresh mechanism
- **Authorization**: Role-based access control
- **Rate Limiting**: Prevents abuse and DDoS attacks
- **Input Validation**: Joi schema validation
- **Password Security**: bcrypt hashing
- **CORS**: Configurable cross-origin resource sharing
- **Headers**: Security headers with Helmet
- **Audit Logging**: Complete action tracking

## Monitoring & Logging

- **Health Checks**: Basic and detailed health endpoints
- **Audit Logs**: User action tracking
- **Error Logging**: Centralized error handling
- **Request Logging**: HTTP request logging with Morgan
- **Performance Metrics**: Response time tracking

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

### Testing

Run the test suite:
```bash
npm test
```

## Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Set production environment variables

3. Run database migrations:
   ```bash
   npm run db:deploy
   ```

4. Start the server:
   ```bash
   npm start
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.