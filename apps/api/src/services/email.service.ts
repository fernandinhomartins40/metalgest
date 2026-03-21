import crypto from 'node:crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '@/config/database';
import { AppError } from '@/middlewares/error';

type SendEmailInput = {
  userId?: string;
  purpose: string;
  toEmail: string;
  subject: string;
  html: string;
  text: string;
  metadata?: Record<string, unknown>;
  trackingEnabled?: boolean;
};

type ActionEmailTemplateInput = {
  preview: string;
  kicker: string;
  title: string;
  greeting: string;
  intro: string;
  actionLabel: string;
  actionUrl: string;
  expiryText: string;
  highlights: string[];
  securityNote: string;
  supportText: string;
  accentColor: string;
};

type VerificationEmailInput = {
  userId: string;
  toEmail: string;
  recipientName: string;
  token: string;
};

type PasswordResetEmailInput = {
  userId: string;
  toEmail: string;
  recipientName: string;
  token: string;
};

type UltraZendAuthMode = 'api_key' | 'access_token';

type UltraZendWebhookPayload = {
  event?: string;
  timestamp?: string;
  webhook_id?: string | number;
  tenant_id?: string | number;
  data?: {
    email_id?: string | number;
    message_id?: string;
    tracking_id?: string;
    subject?: string;
    to?: string;
    status?: string;
    occurred_at?: string;
    error_message?: string;
    failure_reason?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

const DEFAULT_ULTRAZEND_API_URL = 'https://www.ultrazend.com.br/api';

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const toJsonValue = (value: unknown) => value as Prisma.InputJsonValue;

export class EmailService {
  private readEnv(name: string) {
    const value = process.env[name]?.trim();
    return value ? value : null;
  }

  private looksLikeAiAgentKey(value: string) {
    return value.startsWith('uai_');
  }

  private getApiKeyValue() {
    return this.readEnv('ULTRAZEND_API_KEY');
  }

  private getAccessTokenValue() {
    return this.readEnv('ULTRAZEND_ACCESS_TOKEN');
  }

  private getFromEmailValue() {
    return this.readEnv('ULTRAZEND_FROM_EMAIL');
  }

  private getWebhookSecretValue() {
    return this.readEnv('ULTRAZEND_WEBHOOK_SECRET');
  }

  private getConfiguredAuthMode(): UltraZendAuthMode | null {
    if (this.getAccessTokenValue()) {
      return 'access_token';
    }

    const apiKey = this.getApiKeyValue();
    if (!apiKey || this.looksLikeAiAgentKey(apiKey)) {
      return null;
    }

    return 'api_key';
  }

  isConfigured() {
    return Boolean(this.getConfiguredAuthMode() && this.getFromEmailValue());
  }

  getConfigurationSummary() {
    const apiKey = this.getApiKeyValue();
    const accessToken = this.getAccessTokenValue();

    return {
      provider: 'ultrazend',
      configured: this.isConfigured(),
      authMode: this.getConfiguredAuthMode(),
      fromEmailConfigured: Boolean(this.getFromEmailValue()),
      webhookConfigured: Boolean(this.getWebhookSecretValue()),
      frontendUrlConfigured: Boolean(this.readEnv('FRONTEND_URL') || this.readEnv('APP_PUBLIC_URL')),
      hasApiKey: Boolean(apiKey),
      hasAccessToken: Boolean(accessToken),
      misconfiguredAiAgentKey: Boolean(apiKey && this.looksLikeAiAgentKey(apiKey)),
    };
  }

  private getApiUrl() {
    return trimTrailingSlash(process.env.ULTRAZEND_API_URL || DEFAULT_ULTRAZEND_API_URL);
  }

  private getAuthHeaders(): Record<string, string> {
    const accessToken = this.getAccessTokenValue();
    if (accessToken) {
      return {
        Authorization: `Bearer ${accessToken}`,
      };
    }

    const apiKey = this.getApiKeyValue();
    if (!apiKey) {
      throw new AppError(
        503,
        'UltraZend API key or access token is not configured',
        'EMAIL_SERVICE_UNAVAILABLE'
      );
    }

    if (this.looksLikeAiAgentKey(apiKey)) {
      throw new AppError(
        503,
        'UltraZend AI Agent key cannot be used for transactional email. Configure ULTRAZEND_API_KEY or ULTRAZEND_ACCESS_TOKEN.',
        'EMAIL_SERVICE_UNAVAILABLE'
      );
    }

    return {
      'x-api-key': apiKey,
    };
  }

  private getFromEmail() {
    const fromEmail = this.getFromEmailValue();
    if (!fromEmail) {
      throw new AppError(503, 'UltraZend sender email is not configured', 'EMAIL_SERVICE_UNAVAILABLE');
    }

    return fromEmail;
  }

  private getBrandName() {
    return process.env.ULTRAZEND_FROM_NAME || 'MetalGest';
  }

  private getFrontendUrl() {
    const frontendUrl = process.env.FRONTEND_URL || process.env.APP_PUBLIC_URL;
    if (!frontendUrl) {
      throw new AppError(500, 'Frontend URL is not configured', 'CONFIGURATION_ERROR');
    }

    return trimTrailingSlash(frontendUrl);
  }

  private getWebhookSecret() {
    const secret = this.getWebhookSecretValue();
    if (!secret) {
      throw new AppError(503, 'UltraZend webhook secret is not configured', 'EMAIL_WEBHOOK_NOT_CONFIGURED');
    }

    return secret;
  }

  private buildFrontendLink(pathname: string, token: string) {
    const url = new URL(pathname, `${this.getFrontendUrl()}/`);
    url.searchParams.set('token', token);
    return url.toString();
  }

  private buildActionEmailTemplate(input: ActionEmailTemplateInput) {
    const brandName = escapeHtml(this.getBrandName());
    const safeKicker = escapeHtml(input.kicker);
    const safeTitle = escapeHtml(input.title);
    const safeGreeting = escapeHtml(input.greeting);
    const safeIntro = escapeHtml(input.intro);
    const safeExpiry = escapeHtml(input.expiryText);
    const safeSecurityNote = escapeHtml(input.securityNote);
    const safeSupport = escapeHtml(input.supportText);
    const safePreview = escapeHtml(input.preview);
    const highlightRows = input.highlights
      .map(
        (highlight, index) => `
                  <tr>
                    <td style="padding:${index === 0 ? '0' : '12px 0 0'};">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td valign="top" style="width:32px;">
                            <div style="height:24px;width:24px;border-radius:999px;background:${input.accentColor};color:#ffffff;font-size:12px;font-weight:700;line-height:24px;text-align:center;">
                              ${index + 1}
                            </div>
                          </td>
                          <td style="padding-left:10px;font-size:14px;line-height:1.7;color:#334155;">
                            ${escapeHtml(highlight)}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>`
      )
      .join('');

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeTitle}</title>
  </head>
  <body style="margin:0;padding:0;background:#e8eef3;font-family:'Segoe UI',Arial,sans-serif;color:#0f172a;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${safePreview}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;background:#ffffff;border-radius:28px;overflow:hidden;box-shadow:0 24px 70px rgba(15,23,42,0.16);">
            <tr>
              <td style="padding:32px 40px;background:linear-gradient(135deg,#07131a,#10212d);color:#ffffff;">
                <p style="margin:0 0 14px;font-size:12px;letter-spacing:0.24em;text-transform:uppercase;opacity:0.7;">${brandName}</p>
                <div style="display:inline-block;border-radius:999px;background:rgba(255,255,255,0.08);padding:8px 14px;font-size:11px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:#f8fafc;">
                  ${safeKicker}
                </div>
                <h1 style="margin:18px 0 0;font-size:32px;line-height:1.18;">${safeTitle}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 40px 18px;">
                <p style="margin:0 0 16px;font-size:18px;font-weight:700;color:#0f172a;">${safeGreeting}</p>
                <p style="margin:0 0 28px;font-size:16px;line-height:1.8;color:#334155;">${safeIntro}</p>
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                  <tr>
                    <td style="border-radius:999px;background:${input.accentColor};">
                      <a href="${input.actionUrl}" style="display:inline-block;padding:15px 26px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;">
                        ${escapeHtml(input.actionLabel)}
                      </a>
                    </td>
                  </tr>
                </table>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border:1px solid #e2e8f0;border-radius:22px;background:#f8fafc;">
                  <tr>
                    <td style="padding:22px 22px 20px;">
                      <p style="margin:0 0 16px;font-size:13px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#64748b;">
                        O que acontece agora
                      </p>
                      ${highlightRows}
                    </td>
                  </tr>
                </table>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border-radius:22px;background:#fff7ed;border:1px solid #fed7aa;">
                  <tr>
                    <td style="padding:18px 20px;">
                      <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#9a3412;">Prazo do link</p>
                      <p style="margin:0 0 12px;font-size:14px;line-height:1.7;color:#7c2d12;">${safeExpiry}</p>
                      <p style="margin:0;font-size:14px;line-height:1.7;color:#7c2d12;">${safeSecurityNote}</p>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 10px;font-size:14px;line-height:1.7;color:#475569;">Se o botão não abrir, copie e cole este link no navegador:</p>
                <p style="margin:0 0 28px;font-size:13px;line-height:1.8;word-break:break-word;color:${input.accentColor};">${escapeHtml(input.actionUrl)}</p>
                <p style="margin:0 0 18px;font-size:13px;line-height:1.8;color:#64748b;">${safeSupport}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 40px 32px;">
                <div style="border-top:1px solid #e2e8f0;padding-top:18px;font-size:12px;line-height:1.8;color:#94a3b8;">
                  Este e-mail foi enviado automaticamente pela MetalGest para apoiar o acesso seguro da sua conta.
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

    const text = [
      `${this.getBrandName()} - ${input.title}`,
      '',
      input.greeting,
      '',
      input.intro,
      '',
      `${input.actionLabel}: ${input.actionUrl}`,
      '',
      'O que acontece agora:',
      ...input.highlights.map((highlight) => `- ${highlight}`),
      '',
      input.expiryText,
      '',
      input.securityNote,
      '',
      input.supportText,
    ].join('\n');

    return { html, text };
  }

  private extractProviderField(payload: Record<string, unknown>, ...paths: string[]) {
    for (const path of paths) {
      const value = path
        .split('.')
        .reduce<unknown>((current, key) => (current && typeof current === 'object' ? (current as Record<string, unknown>)[key] : undefined), payload);

      if (value !== undefined && value !== null && `${value}`.trim() !== '') {
        return `${value}`;
      }
    }

    return null;
  }

  async sendTransactionalEmail(input: SendEmailInput) {
    const body = {
      from: this.getFromEmail(),
      to: input.toEmail,
      subject: input.subject,
      html: input.html,
      text: input.text,
      tracking_enabled: input.trackingEnabled !== false,
    };

    let payload: Record<string, unknown> | null = null;

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      };

      const response = await fetch(`${this.getApiUrl()}/emails/send`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15000),
      });

      payload = (await response.json().catch(() => null)) as Record<string, unknown> | null;

      if (!response.ok) {
        throw new AppError(
          502,
          `${payload?.error ?? payload?.message ?? 'Failed to send transactional email'}`,
          'EMAIL_SEND_FAILED',
          payload ?? undefined
        );
      }

      const data = (payload?.data as Record<string, unknown> | undefined) || payload || {};
      const providerMessageId = this.extractProviderField(data, 'message_id', 'messageId', 'message.message_id', 'message.id');
      const providerEmailId = this.extractProviderField(data, 'email_id', 'emailId', 'email.id');
      const trackingId = this.extractProviderField(data, 'tracking_id', 'trackingId', 'tracking.id');

      const outboundEmail = await prisma.outboundEmail.create({
        data: {
          userId: input.userId,
          purpose: input.purpose,
          toEmail: input.toEmail,
          fromEmail: this.getFromEmail(),
          subject: input.subject,
          status: 'sent',
          providerMessageId,
          providerEmailId,
          trackingId,
          sentAt: new Date(),
          metadata: toJsonValue({
            request: body,
            response: payload,
            ...input.metadata,
          }),
        },
      });

      return outboundEmail;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send transactional email';

      await prisma.outboundEmail.create({
        data: {
          userId: input.userId,
          purpose: input.purpose,
          toEmail: input.toEmail,
          fromEmail: this.getFromEmail(),
          subject: input.subject,
          status: 'failed',
          errorMessage: message,
          failedAt: new Date(),
          metadata: toJsonValue({
            request: body,
            response: payload,
            ...input.metadata,
          }),
        },
      });

      throw error;
    }
  }

  async sendVerificationEmail(input: VerificationEmailInput) {
    const confirmationUrl = this.buildFrontendLink('/verify-email', input.token);
    const template = this.buildActionEmailTemplate({
      preview: 'Confirme seu cadastro para liberar o acesso completo ao MetalGest.',
      kicker: 'Confirmação de cadastro',
      title: 'Confirme seu cadastro',
      greeting: `Olá, ${input.recipientName || 'cliente'}.`,
      intro:
        'Seu acesso ao MetalGest já foi criado. Falta apenas validar o endereço de e-mail para liberar a entrada na plataforma e manter a conta protegida.',
      actionLabel: 'Confirmar meu e-mail',
      actionUrl: confirmationUrl,
      expiryText: 'Este link fica disponível por 24 horas.',
      highlights: [
        'Abra o link para confirmar que este endereço realmente pertence à sua empresa.',
        'Depois da confirmação, você poderá entrar normalmente pelo login da plataforma.',
        'Se o prazo vencer, você pode pedir um novo envio na tela de confirmação.',
      ],
      securityNote:
        'Se você não criou esta conta, ignore esta mensagem. Nenhum acesso será liberado sem a confirmação do endereço.',
      supportText: 'Se precisar, volte ao login ou à página de confirmação para solicitar um novo link.',
      accentColor: '#b45309',
    });

    return this.sendTransactionalEmail({
      userId: input.userId,
      purpose: 'email_verification',
      toEmail: input.toEmail,
      subject: 'Confirme seu e-mail na MetalGest',
      html: template.html,
      text: template.text,
      metadata: {
        category: 'auth',
        kind: 'verification',
      },
    });
  }

  async sendPasswordResetEmail(input: PasswordResetEmailInput) {
    const resetUrl = this.buildFrontendLink('/reset-password', input.token);
    const template = this.buildActionEmailTemplate({
      preview: 'Recebemos um pedido para redefinir a senha da sua conta MetalGest.',
      kicker: 'Recuperação de senha',
      title: 'Redefinição de senha',
      greeting: `Olá, ${input.recipientName || 'cliente'}.`,
      intro:
        'Recebemos um pedido para trocar a senha da sua conta. Use o botão abaixo para criar uma nova credencial e voltar a acessar a operação com segurança.',
      actionLabel: 'Criar nova senha',
      actionUrl: resetUrl,
      expiryText: 'Este link expira em 1 hora por segurança.',
      highlights: [
        'Abra o formulário de redefinição e crie uma nova senha forte.',
        'Depois da troca, volte ao login com a nova credencial.',
        'Se não foi você, basta ignorar esta mensagem.',
      ],
      securityNote:
        'Sua senha atual continua válida até que uma nova senha seja definida por este formulário.',
      supportText:
        'Se o link perder a validade, solicite um novo envio na página de recuperação de senha.',
      accentColor: '#0f766e',
    });

    return this.sendTransactionalEmail({
      userId: input.userId,
      purpose: 'password_reset',
      toEmail: input.toEmail,
      subject: 'Crie sua nova senha na MetalGest',
      html: template.html,
      text: template.text,
      metadata: {
        category: 'auth',
        kind: 'password_reset',
      },
    });
  }

  verifyWebhookSignature(rawBody: string, signature: string) {
    const expected = crypto
      .createHmac('sha256', this.getWebhookSecret())
      .update(rawBody)
      .digest('hex');

    const expectedSignature = `sha256=${expected}`;

    if (signature.length !== expectedSignature.length) {
      return false;
    }

    return crypto.timingSafeEqual(
      Buffer.from(signature, 'utf8'),
      Buffer.from(expectedSignature, 'utf8')
    );
  }

  async processUltraZendWebhook(payload: UltraZendWebhookPayload, rawBody: string, signature: string) {
    if (!signature || !this.verifyWebhookSignature(rawBody, signature)) {
      throw new AppError(401, 'Invalid webhook signature', 'INVALID_WEBHOOK_SIGNATURE');
    }

    const providerEventKey = crypto.createHash('sha256').update(rawBody).digest('hex');
    const existingEvent = await prisma.emailWebhookEvent.findUnique({
      where: { providerEventKey },
    });

    if (existingEvent) {
      return { duplicate: true };
    }

    const eventName = payload.event || 'unknown';
    const providerMessageId = payload.data?.message_id || null;
    const providerEmailId = payload.data?.email_id ? `${payload.data.email_id}` : null;
    const trackingId = payload.data?.tracking_id || null;
    const occurredAtRaw = payload.data?.occurred_at || payload.timestamp;
    const occurredAt = occurredAtRaw ? new Date(occurredAtRaw) : new Date();

    const outboundEmailWhere = [
      providerMessageId ? { providerMessageId } : undefined,
      providerEmailId ? { providerEmailId } : undefined,
      trackingId ? { trackingId } : undefined,
    ].filter((condition): condition is NonNullable<typeof condition> => Boolean(condition));

    const outboundEmail = outboundEmailWhere.length
      ? await prisma.outboundEmail.findFirst({
          where: {
            OR: outboundEmailWhere,
          },
        })
      : null;

    const webhookEvent = await prisma.emailWebhookEvent.create({
      data: {
        outboundEmailId: outboundEmail?.id,
        providerEventKey,
        webhookId: payload.webhook_id ? `${payload.webhook_id}` : null,
        event: eventName,
        signature,
        providerMessageId,
        providerEmailId,
        trackingId,
        payload: toJsonValue(payload),
      },
    });

    if (outboundEmail) {
      const statusUpdate: Prisma.OutboundEmailUpdateInput = {
        metadata: toJsonValue({
          ...(typeof outboundEmail.metadata === 'object' && outboundEmail.metadata ? outboundEmail.metadata : {}),
          lastWebhookEvent: eventName,
          lastWebhookPayload: payload,
        }),
      };

      if (eventName === 'email.sent') {
        statusUpdate.status = 'sent';
        statusUpdate.sentAt = occurredAt;
      }

      if (eventName === 'email.delivered') {
        statusUpdate.status = 'delivered';
        statusUpdate.deliveredAt = occurredAt;
      }

      if (eventName === 'email.opened') {
        statusUpdate.status = 'opened';
        statusUpdate.openedAt = occurredAt;
      }

      if (eventName === 'email.clicked') {
        statusUpdate.status = 'clicked';
        statusUpdate.clickedAt = occurredAt;
      }

      if (eventName === 'email.failed') {
        statusUpdate.status = 'failed';
        statusUpdate.failedAt = occurredAt;
        statusUpdate.errorMessage =
          payload.data?.error_message?.toString() ||
          payload.data?.failure_reason?.toString() ||
          'Delivery failed';
      }

      await prisma.outboundEmail.update({
        where: { id: outboundEmail.id },
        data: statusUpdate,
      });
    }

    await prisma.emailWebhookEvent.update({
      where: { id: webhookEvent.id },
      data: { processedAt: new Date() },
    });

    return { duplicate: false };
  }
}

export const emailService = new EmailService();
