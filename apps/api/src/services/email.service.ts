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
  title: string;
  greeting: string;
  intro: string;
  actionLabel: string;
  actionUrl: string;
  expiryText: string;
  supportText: string;
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
  isConfigured() {
    return Boolean(process.env.ULTRAZEND_API_KEY && process.env.ULTRAZEND_FROM_EMAIL);
  }

  private getApiUrl() {
    return trimTrailingSlash(process.env.ULTRAZEND_API_URL || DEFAULT_ULTRAZEND_API_URL);
  }

  private getApiKey() {
    const apiKey = process.env.ULTRAZEND_API_KEY;
    if (!apiKey) {
      throw new AppError(503, 'UltraZend API key is not configured', 'EMAIL_SERVICE_UNAVAILABLE');
    }

    return apiKey;
  }

  private getFromEmail() {
    const fromEmail = process.env.ULTRAZEND_FROM_EMAIL;
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
    const secret = process.env.ULTRAZEND_WEBHOOK_SECRET;
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
    const safeTitle = escapeHtml(input.title);
    const safeGreeting = escapeHtml(input.greeting);
    const safeIntro = escapeHtml(input.intro);
    const safeExpiry = escapeHtml(input.expiryText);
    const safeSupport = escapeHtml(input.supportText);
    const safePreview = escapeHtml(input.preview);

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeTitle}</title>
  </head>
  <body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;color:#0f172a;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${safePreview}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(15,23,42,0.12);">
            <tr>
              <td style="padding:32px 40px;background:linear-gradient(135deg,#0f172a,#1e293b);color:#ffffff;">
                <p style="margin:0 0 12px;font-size:12px;letter-spacing:0.24em;text-transform:uppercase;opacity:0.72;">${brandName}</p>
                <h1 style="margin:0;font-size:30px;line-height:1.2;">${safeTitle}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 40px;">
                <p style="margin:0 0 16px;font-size:18px;font-weight:700;">${safeGreeting}</p>
                <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#334155;">${safeIntro}</p>
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                  <tr>
                    <td style="border-radius:999px;background:#0f766e;">
                      <a href="${input.actionUrl}" style="display:inline-block;padding:14px 24px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;">
                        ${escapeHtml(input.actionLabel)}
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#475569;">${safeExpiry}</p>
                <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#475569;">Se o botão não abrir, copie e cole este link no navegador:</p>
                <p style="margin:0 0 28px;font-size:13px;line-height:1.7;word-break:break-word;color:#0f766e;">${escapeHtml(input.actionUrl)}</p>
                <p style="margin:0;font-size:13px;line-height:1.7;color:#64748b;">${safeSupport}</p>
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
      input.expiryText,
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
      const response = await fetch(`${this.getApiUrl()}/emails/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.getApiKey(),
        },
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
      title: 'Confirme seu cadastro',
      greeting: `Ola, ${input.recipientName || 'cliente'}.`,
      intro:
        'Seu acesso ao MetalGest ja foi criado. Agora falta apenas confirmar o email para liberar a entrada na plataforma e manter a seguranca da conta da sua metalurgica.',
      actionLabel: 'Confirmar meu email',
      actionUrl: confirmationUrl,
      expiryText: 'Este link fica disponivel por 24 horas.',
      supportText:
        'Se voce nao solicitou este cadastro, ignore este email. Nenhuma alteracao sera feita sem a confirmacao do endereco.',
    });

    return this.sendTransactionalEmail({
      userId: input.userId,
      purpose: 'email_verification',
      toEmail: input.toEmail,
      subject: 'Confirme seu cadastro na MetalGest',
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
      title: 'Redefinicao de senha',
      greeting: `Ola, ${input.recipientName || 'cliente'}.`,
      intro:
        'Recebemos um pedido para trocar a senha da sua conta. Use o botao abaixo para criar uma nova senha e voltar a acessar a operacao da sua metalurgica com seguranca.',
      actionLabel: 'Criar nova senha',
      actionUrl: resetUrl,
      expiryText: 'Este link expira em 1 hora por seguranca.',
      supportText:
        'Se voce nao pediu a troca de senha, ignore este email. A senha atual continuara valida ate que uma nova seja definida.',
    });

    return this.sendTransactionalEmail({
      userId: input.userId,
      purpose: 'password_reset',
      toEmail: input.toEmail,
      subject: 'Redefina sua senha na MetalGest',
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
