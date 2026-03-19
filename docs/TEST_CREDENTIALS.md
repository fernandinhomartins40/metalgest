# Test Credentials

Estas credenciais sao criadas pelo seed principal em `packages/database/prisma/seed.ts`.

Importante:

- o seed limpa os dados existentes antes de recriar os registros de teste
- use estas contas apenas em ambiente de desenvolvimento, homologacao ou demonstracao

Para recriar os usuarios:

```bash
npm run prisma:seed --workspace @metalgest/api
```

## Usuarios de teste

| Perfil | Email | Senha | Uso sugerido |
| --- | --- | --- | --- |
| Administrador | `admin@metalgest.com` | `admin123` | Validar acesso administrativo completo |
| Gestor demo | `user@metalgest.com` | `user123` | Navegar pelo fluxo principal do sistema |
| Comercial | `comercial@metalgest.com` | `comercial123` | Testar rotina de atendimento e orcamentos |
| Financeiro | `financeiro@metalgest.com` | `financeiro123` | Testar consultas e rotinas financeiras |
| Producao | `producao@metalgest.com` | `producao123` | Testar acompanhamento operacional |
