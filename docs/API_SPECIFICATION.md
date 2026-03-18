# MetalGest API Specification

Base URL local:

```text
http://localhost/api
```

Base URL em desenvolvimento sem Nginx:

```text
http://localhost:3001/api
```

## Autenticacao

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`
- `PUT /auth/profile`
- `PUT /auth/change-password`

Observacoes:

- `access token` vai no header `Authorization: Bearer ...`
- `refresh token` e persistido em cookie `HttpOnly`

## Recursos principais

- `GET|POST|PUT|DELETE /users`
- `GET|POST|PUT|DELETE /clients`
- `GET|POST|PUT|DELETE /products`
- `PATCH /products/:id/stock`
- `GET|POST|PUT|DELETE /services`
- `GET|POST|PUT|DELETE /quotes`
- `PATCH /quotes/:id/status`
- `POST /quotes/:id/duplicate`
- `PATCH /quotes/:id/public-link`
- `GET /quotes/public/:token`
- `PATCH /quotes/public/:token/status`
- `GET|POST|PUT|DELETE /service-orders`
- `PATCH /service-orders/:id/status`
- `GET|POST|PUT|DELETE /transactions`
- `GET /transactions/balance`
- `GET /transactions/summary/category`
- `GET /transactions/summary/month`
- `GET /dashboard/stats`
- `GET /dashboard/revenue-chart`
- `GET /dashboard/quotes-conversion`
- `GET /dashboard/top-clients`
- `GET|PUT|DELETE /settings/:key`
- `GET|PUT /settings/company`
- `POST /settings/bulk`
- `GET /audit-logs`
- `POST /upload/logo`
- `POST /upload/documents`

## Healthcheck

- `GET /health`

## Uploads

Arquivos enviados pela API ficam acessiveis por URLs no formato:

```text
/api/uploads/logos/<arquivo>
/api/uploads/documents/<arquivo>
```

## Erros

Formato padrao:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```
