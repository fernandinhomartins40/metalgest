# UltraZend Integration

This project now supports transactional email for:

- account email verification
- password recovery
- UltraZend webhook processing with HMAC SHA256 validation

## Runtime env vars

Set these variables outside the repository:

```env
APP_PUBLIC_URL=https://metalgest.com.br
AUTH_REQUIRE_EMAIL_VERIFICATION=true
ULTRAZEND_API_URL=https://www.ultrazend.com.br/api
ULTRAZEND_FROM_EMAIL=noreply@metalgest.com.br
ULTRAZEND_FROM_NAME=MetalGest
ULTRAZEND_API_KEY=
ULTRAZEND_ACCESS_TOKEN=
ULTRAZEND_WEBHOOK_SECRET=
```

Use one transactional credential for sending:

- preferred: `ULTRAZEND_API_KEY`
- alternative: `ULTRAZEND_ACCESS_TOKEN`

Do not use `ULTRAZEND_AI_AGENT_KEY` here. That key is only for MCP/IDE integrations and cannot send transactional email for this application.

## Backend endpoints

- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/verify-email`
- `POST /api/auth/resend-verification`
- `POST /api/email/webhooks/ultrazend`

## Webhook

Configured UltraZend webhook target:

```text
https://metalgest.com.br/api/email/webhooks/ultrazend
```

Expected events:

- `email.sent`
- `email.delivered`
- `email.opened`
- `email.clicked`
- `email.failed`

The backend validates `X-Webhook-Signature` using:

```text
sha256=<hex hmac of raw request body>
```

## Notes

- Do not commit real UltraZend secrets.
- The MCP key must stay outside the repository and be referenced through `ULTRAZEND_AI_AGENT_KEY`.
- `ULTRAZEND_WEBHOOK_SECRET` is only required for webhook validation. Password recovery and verification emails only need a transactional credential plus `ULTRAZEND_FROM_EMAIL`.
- The production webhook only starts succeeding after the backend with the new route is deployed.
