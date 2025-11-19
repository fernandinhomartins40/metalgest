# MetalGest API Specification

> **Base URL:** `http://localhost:3010/api`
> **Production:** `https://metalgest.com.br/api`
> **Version:** v1
> **Authentication:** JWT Bearer Token

## 📋 Table of Contents

- [Authentication](#authentication)
- [Users](#users)
- [Clients](#clients)
- [Products](#products)
- [Services](#services)
- [Quotes](#quotes)
- [Service Orders](#service-orders)
- [Transactions](#transactions)
- [Dashboard](#dashboard)
- [Settings](#settings)
- [Upload](#upload)

---

## 🔐 Authentication

### POST `/auth/register`

Register a new user.

**Request:**
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "SenhaSegura123!",
  "confirmPassword": "SenhaSegura123!"
}
```

**Response** `201`:
```json
{
  "user": {
    "id": "uuid",
    "email": "joao@example.com",
    "name": "João Silva",
    "role": "USER",
    "active": true,
    "emailVerified": false,
    "plan": "FREE",
    "subscriptionStatus": "TRIAL"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

---

### POST `/auth/login`

Login with email and password.

**Request:**
```json
{
  "email": "joao@example.com",
  "password": "SenhaSegura123!"
}
```

**Response** `200`:
```json
{
  "user": {
    "id": "uuid",
    "email": "joao@example.com",
    "name": "João Silva",
    "role": "USER"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

---

### POST `/auth/refresh`

Refresh access token.

**Request:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response** `200`:
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

---

### POST `/auth/logout`

Logout and invalidate refresh token.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response** `200`:
```json
{
  "message": "Logged out successfully"
}
```

---

### GET `/auth/me`

Get current user profile.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response** `200`:
```json
{
  "id": "uuid",
  "email": "joao@example.com",
  "name": "João Silva",
  "role": "USER",
  "active": true,
  "emailVerified": false,
  "plan": "FREE",
  "subscriptionStatus": "TRIAL",
  "phone": null,
  "avatar": null,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "lastLogin": "2025-01-15T10:30:00.000Z"
}
```

---

### PUT `/auth/profile`

Update user profile.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "name": "João Pedro Silva",
  "phone": "+55 11 98765-4321",
  "avatar": "https://example.com/avatar.jpg"
}
```

**Response** `200`:
```json
{
  "id": "uuid",
  "name": "João Pedro Silva",
  "email": "joao@example.com",
  "phone": "+55 11 98765-4321",
  "avatar": "https://example.com/avatar.jpg"
}
```

---

### PUT `/auth/change-password`

Change password.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "currentPassword": "SenhaAntiga123!",
  "newPassword": "NovaSenha123!",
  "confirmPassword": "NovaSenha123!"
}
```

**Response** `200`:
```json
{
  "message": "Password changed successfully"
}
```

---

## 👥 Users

### GET `/users`

List all users (Admin only).

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `search` (string, optional)
- `role` (USER | ADMIN | MANAGER, optional)
- `active` (boolean, optional)

**Response** `200`:
```json
{
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "User Name",
      "role": "USER",
      "active": true,
      "plan": "PREMIUM",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

---

### POST `/users`

Create new user (Admin only).

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "Senha123!",
  "role": "USER"
}
```

**Response** `201`:
```json
{
  "id": "uuid",
  "email": "newuser@example.com",
  "name": "New User",
  "role": "USER",
  "active": true
}
```

---

### GET `/users/:id`

Get user by ID (Admin only).

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response** `200`:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "User Name",
  "role": "USER",
  "active": true,
  "plan": "PREMIUM",
  "subscriptionStatus": "ACTIVE",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "lastLogin": "2025-01-15T10:30:00.000Z"
}
```

---

### PUT `/users/:id`

Update user (Admin only).

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "name": "Updated Name",
  "role": "MANAGER",
  "active": true
}
```

**Response** `200`:
```json
{
  "id": "uuid",
  "name": "Updated Name",
  "role": "MANAGER",
  "active": true
}
```

---

### DELETE `/users/:id`

Delete user (Admin only).

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response** `204`: No Content

---

## 🏢 Clients

### GET `/clients`

List all clients.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `search` (string, optional)
- `type` (INDIVIDUAL | BUSINESS, optional)
- `category` (POTENTIAL | REGULAR | VIP, optional)
- `active` (boolean, optional)
- `sortBy` (name | createdAt, default: createdAt)
- `order` (asc | desc, default: desc)

**Response** `200`:
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "BUSINESS",
      "name": "Empresa XYZ Ltda",
      "email": "contato@empresa.com",
      "phone": "+55 11 3456-7890",
      "document": "12.345.678/0001-90",
      "category": "REGULAR",
      "active": true,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

### POST `/clients`

Create new client.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "type": "BUSINESS",
  "name": "Empresa ABC Ltda",
  "email": "contato@empresa.com",
  "phone": "+55 11 3456-7890",
  "mobile": "+55 11 98765-4321",
  "document": "12.345.678/0001-90",
  "stateRegistration": "123.456.789.012",
  "zipCode": "01310-100",
  "street": "Av. Paulista",
  "number": "1000",
  "city": "São Paulo",
  "state": "SP",
  "category": "REGULAR"
}
```

**Response** `201`:
```json
{
  "id": "uuid",
  "type": "BUSINESS",
  "name": "Empresa ABC Ltda",
  "email": "contato@empresa.com",
  "document": "12.345.678/0001-90",
  "category": "REGULAR",
  "active": true,
  "createdAt": "2025-01-15T00:00:00.000Z"
}
```

---

### GET `/clients/:id`

Get client by ID.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response** `200`:
```json
{
  "id": "uuid",
  "type": "BUSINESS",
  "name": "Empresa ABC Ltda",
  "email": "contato@empresa.com",
  "phone": "+55 11 3456-7890",
  "mobile": "+55 11 98765-4321",
  "document": "12.345.678/0001-90",
  "stateRegistration": "123.456.789.012",
  "zipCode": "01310-100",
  "street": "Av. Paulista",
  "number": "1000",
  "city": "São Paulo",
  "state": "SP",
  "category": "REGULAR",
  "active": true,
  "notes": null,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-15T00:00:00.000Z"
}
```

---

### PUT `/clients/:id`

Update client.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "name": "Empresa ABC - Atualizada",
  "category": "VIP",
  "notes": "Cliente importante"
}
```

**Response** `200`:
```json
{
  "id": "uuid",
  "name": "Empresa ABC - Atualizada",
  "category": "VIP",
  "notes": "Cliente importante",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

---

### DELETE `/clients/:id`

Delete client.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response** `204`: No Content

---

## 📦 Products

### GET `/products`

List all products.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `search` (string, optional)
- `category` (string, optional)
- `active` (boolean, optional)
- `sortBy` (name | price | stock | createdAt, default: createdAt)
- `order` (asc | desc, default: desc)

**Response** `200`:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Produto XYZ",
      "description": "Descrição do produto",
      "price": "199.90",
      "cost": "100.00",
      "category": "Eletrônicos",
      "stock": 50,
      "minStock": 10,
      "sku": "PROD-001",
      "active": true,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 200,
    "totalPages": 20
  }
}
```

---

### POST `/products`

Create new product.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "name": "Novo Produto",
  "description": "Descrição detalhada",
  "price": 299.90,
  "cost": 150.00,
  "category": "Categoria A",
  "stock": 100,
  "minStock": 20,
  "sku": "PROD-002",
  "barcode": "7891234567890",
  "weight": 1.5,
  "width": 10,
  "height": 20,
  "depth": 5,
  "images": ["url1.jpg", "url2.jpg"]
}
```

**Response** `201`:
```json
{
  "id": "uuid",
  "name": "Novo Produto",
  "price": "299.90",
  "sku": "PROD-002",
  "stock": 100,
  "active": true,
  "createdAt": "2025-01-15T00:00:00.000Z"
}
```

---

### GET `/products/:id`

Get product by ID.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response** `200`:
```json
{
  "id": "uuid",
  "name": "Produto XYZ",
  "description": "Descrição detalhada",
  "price": "199.90",
  "cost": "100.00",
  "category": "Eletrônicos",
  "stock": 50,
  "minStock": 10,
  "sku": "PROD-001",
  "barcode": "7891234567890",
  "weight": 1.5,
  "width": 10,
  "height": 20,
  "depth": 5,
  "images": ["url1.jpg"],
  "active": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-15T00:00:00.000Z"
}
```

---

### PUT `/products/:id`

Update product.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "name": "Produto Atualizado",
  "price": 249.90,
  "stock": 75
}
```

**Response** `200`:
```json
{
  "id": "uuid",
  "name": "Produto Atualizado",
  "price": "249.90",
  "stock": 75,
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

---

### DELETE `/products/:id`

Delete product.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response** `204`: No Content

---

## 🛠️ Services

### GET `/services`

List all services.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `search` (string, optional)
- `category` (string, optional)
- `active` (boolean, optional)
- `sortBy` (name | price | createdAt, default: createdAt)
- `order` (asc | desc, default: desc)

**Response** `200`:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Serviço de Consultoria",
      "description": "Consultoria especializada",
      "price": "500.00",
      "category": "Consultoria",
      "duration": 120,
      "active": true,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

---

### POST `/services`

Create new service.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "name": "Novo Serviço",
  "description": "Descrição do serviço",
  "price": 300.00,
  "category": "Manutenção",
  "duration": 60
}
```

**Response** `201`:
```json
{
  "id": "uuid",
  "name": "Novo Serviço",
  "price": "300.00",
  "category": "Manutenção",
  "duration": 60,
  "active": true,
  "createdAt": "2025-01-15T00:00:00.000Z"
}
```

---

### GET `/services/:id`

Get service by ID.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response** `200`:
```json
{
  "id": "uuid",
  "name": "Serviço de Consultoria",
  "description": "Consultoria especializada",
  "price": "500.00",
  "category": "Consultoria",
  "duration": 120,
  "active": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-15T00:00:00.000Z"
}
```

---

### PUT `/services/:id`

Update service.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "name": "Serviço Atualizado",
  "price": 600.00
}
```

**Response** `200`:
```json
{
  "id": "uuid",
  "name": "Serviço Atualizado",
  "price": "600.00",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

---

### DELETE `/services/:id`

Delete service.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response** `204`: No Content

---

## 📋 Quotes

### GET `/quotes`

List all quotes.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `search` (string, optional)
- `status` (DRAFT | PENDING | APPROVED | REJECTED | EXPIRED, optional)
- `clientId` (uuid, optional)
- `sortBy` (createdAt | totalValue, default: createdAt)
- `order` (asc | desc, default: desc)

**Response** `200`:
```json
{
  "data": [
    {
      "id": "uuid",
      "description": "Orçamento para projeto X",
      "totalValue": "5000.00",
      "status": "PENDING",
      "validUntil": "2025-02-01T00:00:00.000Z",
      "client": {
        "id": "uuid",
        "name": "Cliente ABC"
      },
      "createdAt": "2025-01-15T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15
  }
}
```

---

### POST `/quotes`

Create new quote.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "clientId": "uuid",
  "description": "Orçamento para serviço completo",
  "validUntil": "2025-02-15T00:00:00.000Z",
  "profitPercentage": 30,
  "terms": "Pagamento em 30 dias",
  "notes": "Cliente solicitou desconto",
  "products": [
    {
      "productId": "uuid",
      "quantity": 5,
      "unitPrice": 199.90,
      "discount": 50.00
    }
  ],
  "services": [
    {
      "serviceId": "uuid",
      "quantity": 2,
      "unitPrice": 500.00,
      "discount": 0
    }
  ]
}
```

**Response** `201`:
```json
{
  "id": "uuid",
  "clientId": "uuid",
  "description": "Orçamento para serviço completo",
  "totalValue": "1949.50",
  "status": "DRAFT",
  "validUntil": "2025-02-15T00:00:00.000Z",
  "createdAt": "2025-01-15T00:00:00.000Z"
}
```

---

### GET `/quotes/:id`

Get quote by ID.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response** `200`:
```json
{
  "id": "uuid",
  "description": "Orçamento para serviço completo",
  "totalValue": "1949.50",
  "profitPercentage": 30,
  "status": "PENDING",
  "validUntil": "2025-02-15T00:00:00.000Z",
  "terms": "Pagamento em 30 dias",
  "notes": "Cliente solicitou desconto",
  "client": {
    "id": "uuid",
    "name": "Cliente ABC",
    "email": "cliente@example.com"
  },
  "quoteItems": [
    {
      "id": "uuid",
      "product": {
        "id": "uuid",
        "name": "Produto XYZ"
      },
      "quantity": 5,
      "unitPrice": "199.90",
      "discount": "50.00",
      "total": "949.50"
    }
  ],
  "serviceItems": [
    {
      "id": "uuid",
      "service": {
        "id": "uuid",
        "name": "Serviço ABC"
      },
      "quantity": 2,
      "unitPrice": "500.00",
      "discount": "0.00",
      "total": "1000.00"
    }
  ],
  "createdAt": "2025-01-15T00:00:00.000Z",
  "updatedAt": "2025-01-15T00:00:00.000Z"
}
```

---

### PUT `/quotes/:id`

Update quote.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "status": "APPROVED",
  "notes": "Cliente aprovou o orçamento"
}
```

**Response** `200`:
```json
{
  "id": "uuid",
  "status": "APPROVED",
  "notes": "Cliente aprovou o orçamento",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

---

### DELETE `/quotes/:id`

Delete quote.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response** `204`: No Content

---

### POST `/quotes/:id/duplicate`

Duplicate quote.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response** `201`:
```json
{
  "id": "new-uuid",
  "description": "Orçamento para serviço completo (Cópia)",
  "totalValue": "1949.50",
  "status": "DRAFT",
  "createdAt": "2025-01-15T10:30:00.000Z"
}
```

---

### POST `/quotes/:id/public-link`

Generate public link for quote.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "expiresInDays": 7
}
```

**Response** `200`:
```json
{
  "publicToken": "abc123def456",
  "publicUrl": "https://metalgest.com.br/quote/abc123def456",
  "expiresAt": "2025-01-22T00:00:00.000Z"
}
```

---

### GET `/quotes/public/:token`

Get public quote (no auth required).

**Response** `200`:
```json
{
  "id": "uuid",
  "description": "Orçamento para serviço completo",
  "totalValue": "1949.50",
  "validUntil": "2025-02-15T00:00:00.000Z",
  "company": {
    "name": "Empresa XYZ",
    "logo": "https://example.com/logo.png"
  },
  "items": [...]
}
```

---

### POST `/quotes/:id/pdf`

Generate PDF for quote.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response** `200`:
```json
{
  "url": "https://example.com/quotes/quote-uuid.pdf",
  "filename": "orcamento-12345.pdf"
}
```

---

## 🏭 Service Orders

### GET `/service-orders`

List all service orders.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `search` (string, optional)
- `status` (WAITING | IN_PROGRESS | PAUSED | FINISHED | DELIVERED | CANCELLED, optional)
- `priority` (LOW | MEDIUM | HIGH | URGENT, optional)
- `sortBy` (createdAt | deadline | priority, default: createdAt)
- `order` (asc | desc, default: desc)

**Response** `200`:
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Ordem de Serviço #001",
      "description": "Manutenção completa",
      "status": "IN_PROGRESS",
      "priority": "HIGH",
      "deadline": "2025-01-20T00:00:00.000Z",
      "estimatedHours": "10.00",
      "actualHours": "5.50",
      "createdAt": "2025-01-15T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 75,
    "totalPages": 8
  }
}
```

---

### POST `/service-orders`

Create new service order.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "quoteId": "uuid",
  "title": "Ordem de Serviço #002",
  "description": "Instalação e configuração",
  "priority": "MEDIUM",
  "deadline": "2025-01-25T00:00:00.000Z",
  "estimatedHours": 8
}
```

**Response** `201`:
```json
{
  "id": "uuid",
  "title": "Ordem de Serviço #002",
  "status": "WAITING",
  "priority": "MEDIUM",
  "deadline": "2025-01-25T00:00:00.000Z",
  "estimatedHours": "8.00",
  "createdAt": "2025-01-15T00:00:00.000Z"
}
```

---

### GET `/service-orders/:id`

Get service order by ID.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response** `200`:
```json
{
  "id": "uuid",
  "title": "Ordem de Serviço #001",
  "description": "Manutenção completa",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "deadline": "2025-01-20T00:00:00.000Z",
  "startedAt": "2025-01-15T08:00:00.000Z",
  "pausedAt": null,
  "finishedAt": null,
  "deliveredAt": null,
  "estimatedHours": "10.00",
  "actualHours": "5.50",
  "notes": "Cliente solicitou prioridade",
  "quote": {
    "id": "uuid",
    "description": "Orçamento relacionado"
  },
  "createdAt": "2025-01-15T00:00:00.000Z",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

---

### PUT `/service-orders/:id`

Update service order.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "status": "FINISHED",
  "actualHours": 9.5,
  "notes": "Serviço concluído com sucesso"
}
```

**Response** `200`:
```json
{
  "id": "uuid",
  "status": "FINISHED",
  "actualHours": "9.50",
  "finishedAt": "2025-01-15T18:00:00.000Z",
  "notes": "Serviço concluído com sucesso",
  "updatedAt": "2025-01-15T18:00:00.000Z"
}
```

---

### DELETE `/service-orders/:id`

Delete service order.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response** `204`: No Content

---

### POST `/service-orders/from-quote/:quoteId`

Create service order from quote.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "title": "OS gerada do orçamento #123",
  "priority": "HIGH",
  "deadline": "2025-01-25T00:00:00.000Z"
}
```

**Response** `201`:
```json
{
  "id": "uuid",
  "quoteId": "uuid",
  "title": "OS gerada do orçamento #123",
  "status": "WAITING",
  "priority": "HIGH",
  "deadline": "2025-01-25T00:00:00.000Z",
  "createdAt": "2025-01-15T00:00:00.000Z"
}
```

---

## 💰 Transactions

### GET `/transactions`

List all transactions.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `search` (string, optional)
- `type` (INCOME | EXPENSE, optional)
- `status` (PENDING | PAID | CANCELLED | OVERDUE, optional)
- `category` (string, optional)
- `startDate` (ISO date, optional)
- `endDate` (ISO date, optional)
- `sortBy` (date | value | dueDate, default: date)
- `order` (asc | desc, default: desc)

**Response** `200`:
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "INCOME",
      "description": "Pagamento do cliente XYZ",
      "value": "5000.00",
      "paymentMethod": "PIX",
      "category": "Vendas",
      "status": "PAID",
      "date": "2025-01-15T00:00:00.000Z",
      "paidAt": "2025-01-15T10:00:00.000Z",
      "createdAt": "2025-01-15T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 300,
    "totalPages": 30
  }
}
```

---

### POST `/transactions`

Create new transaction.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "type": "EXPENSE",
  "description": "Compra de matéria-prima",
  "value": 1500.00,
  "paymentMethod": "BANK_TRANSFER",
  "category": "Compras",
  "date": "2025-01-15T00:00:00.000Z",
  "dueDate": "2025-02-15T00:00:00.000Z",
  "documentNumber": "NF-12345",
  "notes": "Fornecedor ABC"
}
```

**Response** `201`:
```json
{
  "id": "uuid",
  "type": "EXPENSE",
  "description": "Compra de matéria-prima",
  "value": "1500.00",
  "paymentMethod": "BANK_TRANSFER",
  "category": "Compras",
  "status": "PENDING",
  "date": "2025-01-15T00:00:00.000Z",
  "dueDate": "2025-02-15T00:00:00.000Z",
  "createdAt": "2025-01-15T00:00:00.000Z"
}
```

---

### GET `/transactions/:id`

Get transaction by ID.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response** `200`:
```json
{
  "id": "uuid",
  "type": "INCOME",
  "description": "Pagamento do cliente XYZ",
  "value": "5000.00",
  "paymentMethod": "PIX",
  "category": "Vendas",
  "status": "PAID",
  "date": "2025-01-15T00:00:00.000Z",
  "dueDate": null,
  "paidAt": "2025-01-15T10:00:00.000Z",
  "documentNumber": "NF-98765",
  "attachments": ["https://example.com/nf.pdf"],
  "notes": "Cliente VIP",
  "createdAt": "2025-01-15T00:00:00.000Z",
  "updatedAt": "2025-01-15T10:00:00.000Z"
}
```

---

### PUT `/transactions/:id`

Update transaction.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "status": "PAID",
  "paidAt": "2025-01-15T15:00:00.000Z"
}
```

**Response** `200`:
```json
{
  "id": "uuid",
  "status": "PAID",
  "paidAt": "2025-01-15T15:00:00.000Z",
  "updatedAt": "2025-01-15T15:00:00.000Z"
}
```

---

### DELETE `/transactions/:id`

Delete transaction.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response** `204`: No Content

---

### GET `/transactions/summary`

Get transaction summary.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `startDate` (ISO date, required)
- `endDate` (ISO date, required)

**Response** `200`:
```json
{
  "totalIncome": "50000.00",
  "totalExpense": "30000.00",
  "balance": "20000.00",
  "incomeCount": 45,
  "expenseCount": 78,
  "pendingIncome": "5000.00",
  "pendingExpense": "3000.00",
  "paidIncome": "45000.00",
  "paidExpense": "27000.00"
}
```

---

### GET `/transactions/balance`

Get current balance.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response** `200`:
```json
{
  "currentBalance": "15000.00",
  "pendingIncome": "8000.00",
  "pendingExpense": "4500.00",
  "projectedBalance": "18500.00"
}
```

---

## 📊 Dashboard

### GET `/dashboard/stats`

Get dashboard statistics.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response** `200`:
```json
{
  "totalClients": 150,
  "totalProducts": 200,
  "totalServices": 50,
  "totalQuotes": 300,
  "pendingQuotes": 45,
  "approvedQuotes": 180,
  "totalServiceOrders": 120,
  "activeServiceOrders": 25,
  "totalRevenue": "250000.00",
  "monthlyRevenue": "45000.00",
  "pendingPayments": "12000.00"
}
```

---

### GET `/dashboard/charts`

Get data for dashboard charts.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `period` (7d | 30d | 90d | 1y, default: 30d)

**Response** `200`:
```json
{
  "revenue": [
    { "date": "2025-01-01", "value": "5000.00" },
    { "date": "2025-01-02", "value": "7500.00" }
  ],
  "quotes": [
    { "status": "PENDING", "count": 45 },
    { "status": "APPROVED", "count": 180 }
  ],
  "serviceOrders": [
    { "status": "IN_PROGRESS", "count": 25 },
    { "status": "FINISHED", "count": 95 }
  ],
  "topProducts": [
    { "name": "Produto A", "sales": 150 },
    { "name": "Produto B", "sales": 120 }
  ],
  "topClients": [
    { "name": "Cliente VIP 1", "totalValue": "50000.00" },
    { "name": "Cliente VIP 2", "totalValue": "45000.00" }
  ]
}
```

---

### GET `/dashboard/recent-quotes`

Get recent quotes.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `limit` (number, default: 5)

**Response** `200`:
```json
[
  {
    "id": "uuid",
    "description": "Orçamento recente 1",
    "totalValue": "5000.00",
    "status": "PENDING",
    "client": {
      "name": "Cliente ABC"
    },
    "createdAt": "2025-01-15T00:00:00.000Z"
  }
]
```

---

## ⚙️ Settings

### GET `/settings/company`

Get company settings.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response** `200`:
```json
{
  "name": "Minha Empresa Ltda",
  "tradeName": "Minha Empresa",
  "document": "12.345.678/0001-90",
  "phone": "+55 11 3456-7890",
  "email": "contato@empresa.com",
  "website": "https://empresa.com",
  "zipCode": "01310-100",
  "street": "Av. Paulista",
  "number": "1000",
  "city": "São Paulo",
  "state": "SP",
  "logo": "https://example.com/logo.png",
  "invoicePrefix": "NF",
  "invoiceNumber": 1234
}
```

---

### PUT `/settings/company`

Update company settings.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "name": "Empresa Atualizada Ltda",
  "phone": "+55 11 98765-4321",
  "logo": "https://example.com/new-logo.png"
}
```

**Response** `200`:
```json
{
  "name": "Empresa Atualizada Ltda",
  "phone": "+55 11 98765-4321",
  "logo": "https://example.com/new-logo.png",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

---

### GET `/settings/system`

Get system settings.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response** `200`:
```json
{
  "timezone": "America/Sao_Paulo",
  "language": "pt-BR",
  "currency": "BRL",
  "dateFormat": "DD/MM/YYYY",
  "timeFormat": "HH:mm",
  "decimalSeparator": ",",
  "thousandSeparator": "."
}
```

---

### PUT `/settings/system`

Update system settings.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "timezone": "America/New_York",
  "language": "en-US",
  "dateFormat": "MM/DD/YYYY"
}
```

**Response** `200`:
```json
{
  "timezone": "America/New_York",
  "language": "en-US",
  "dateFormat": "MM/DD/YYYY",
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

---

### GET `/settings/notifications`

Get notification settings.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response** `200`:
```json
{
  "emailNotifications": true,
  "emailQuoteApproved": true,
  "emailQuoteRejected": true,
  "emailServiceOrderUpdated": true,
  "emailTransactionPaid": true,
  "pushNotifications": false
}
```

---

### PUT `/settings/notifications`

Update notification settings.

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "emailNotifications": true,
  "pushNotifications": true
}
```

**Response** `200`:
```json
{
  "emailNotifications": true,
  "pushNotifications": true,
  "updatedAt": "2025-01-15T10:30:00.000Z"
}
```

---

## 📤 Upload

### POST `/upload/logo`

Upload company logo.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

**Request:**
```
file: (binary)
```

**Response** `200`:
```json
{
  "url": "https://example.com/uploads/logo-uuid.png",
  "filename": "logo.png",
  "size": 123456
}
```

---

### POST `/upload/documents`

Upload document.

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

**Request:**
```
file: (binary)
```

**Response** `200`:
```json
{
  "url": "https://example.com/uploads/document-uuid.pdf",
  "filename": "invoice.pdf",
  "size": 654321
}
```

---

## ❌ Error Responses

All error responses follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional additional details
  }
}
```

### Common Error Codes:

- `400` - Bad Request
  - `VALIDATION_ERROR` - Invalid input data
  - `INVALID_CREDENTIALS` - Wrong email/password

- `401` - Unauthorized
  - `UNAUTHORIZED` - Missing or invalid token
  - `TOKEN_EXPIRED` - Access token expired

- `403` - Forbidden
  - `FORBIDDEN` - Insufficient permissions
  - `ROLE_REQUIRED` - Required role not met

- `404` - Not Found
  - `NOT_FOUND` - Resource not found

- `409` - Conflict
  - `ALREADY_EXISTS` - Resource already exists
  - `DUPLICATE_EMAIL` - Email already registered

- `500` - Internal Server Error
  - `INTERNAL_ERROR` - Unexpected server error

---

## 🔒 Authentication Flow

1. **Register** → `POST /auth/register` → Get access/refresh tokens
2. **Login** → `POST /auth/login` → Get access/refresh tokens
3. **Use API** → Include `Authorization: Bearer {accessToken}` header
4. **Token Expires** → `POST /auth/refresh` → Get new tokens
5. **Logout** → `POST /auth/logout` → Invalidate refresh token

---

## 📝 Notes

- All timestamps are in ISO 8601 format (UTC)
- Decimal values are returned as strings to preserve precision
- Pagination is 1-indexed (first page is 1, not 0)
- Default page size is 10 items
- Maximum page size is 100 items
- All file uploads have a 10MB limit
- Public quote links expire after 7 days by default

---

**API Version:** 1.0.0
**Last Updated:** 2025-01-15
