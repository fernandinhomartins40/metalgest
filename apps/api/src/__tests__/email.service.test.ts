import { prisma } from '@/config/database';
import { AppError } from '@/middlewares/error';
import { emailService } from '@/services/email.service';

jest.mock('@/config/database', () => ({
  prisma: {
    outboundEmail: {
      create: jest.fn(),
    },
  },
}));

const mockedPrisma = prisma as {
  outboundEmail: {
    create: jest.Mock;
  };
};

describe('EmailService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetAllMocks();
    process.env = { ...originalEnv };

    delete process.env.FRONTEND_URL;
    delete process.env.APP_PUBLIC_URL;
    delete process.env.ULTRAZEND_FROM_EMAIL;
    delete process.env.ULTRAZEND_FROM_NAME;
    delete process.env.ULTRAZEND_API_KEY;
    delete process.env.ULTRAZEND_ACCESS_TOKEN;
    delete process.env.ULTRAZEND_WEBHOOK_SECRET;

    global.fetch = jest.fn() as unknown as typeof fetch;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('treats a transactional API key as a valid configuration', () => {
    process.env.ULTRAZEND_API_KEY = 're_test';
    process.env.ULTRAZEND_FROM_EMAIL = 'noreply@metalgest.com.br';

    expect(emailService.isConfigured()).toBe(true);
    expect(emailService.getConfigurationSummary()).toMatchObject({
      configured: true,
      authMode: 'api_key',
      fromEmailConfigured: true,
      misconfiguredAiAgentKey: false,
    });
  });

  it('accepts an access token as an alternative authentication mode', () => {
    process.env.ULTRAZEND_ACCESS_TOKEN = 'access-token';
    process.env.ULTRAZEND_FROM_EMAIL = 'noreply@metalgest.com.br';

    expect(emailService.isConfigured()).toBe(true);
    expect(emailService.getConfigurationSummary()).toMatchObject({
      configured: true,
      authMode: 'access_token',
      hasAccessToken: true,
    });
  });

  it('does not treat an AI agent key as a transactional email credential', () => {
    process.env.ULTRAZEND_API_KEY = 'uai_test';
    process.env.ULTRAZEND_FROM_EMAIL = 'noreply@metalgest.com.br';

    expect(emailService.isConfigured()).toBe(false);
    expect(emailService.getConfigurationSummary()).toMatchObject({
      configured: false,
      authMode: null,
      misconfiguredAiAgentKey: true,
    });
  });

  it('uses bearer authentication when an UltraZend access token is configured', async () => {
    process.env.FRONTEND_URL = 'https://metalgest.com.br';
    process.env.ULTRAZEND_ACCESS_TOKEN = 'access-token';
    process.env.ULTRAZEND_FROM_EMAIL = 'noreply@metalgest.com.br';
    process.env.ULTRAZEND_FROM_NAME = 'MetalGest';

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          message_id: 'message-1',
          email_id: 'email-1',
          tracking_id: 'tracking-1',
        },
      }),
    });

    mockedPrisma.outboundEmail.create.mockResolvedValue({ id: 'outbound-1' });

    await emailService.sendPasswordResetEmail({
      userId: 'user-1',
      toEmail: 'admin@metalgest.com',
      recipientName: 'Admin',
      token: 'reset-token',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/emails/send'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer access-token',
          'Content-Type': 'application/json',
        }),
      })
    );

    const requestBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);

    expect(requestBody.subject).toBe('Crie sua nova senha na MetalGest');
    expect(requestBody.html).toContain('https://metalgest.com.br/reset-password?token=reset-token');
    expect(requestBody.html).toContain('O que acontece agora');
    expect(requestBody.html).toContain('Se o botao nao abrir');
    expect(requestBody.text).toContain('- Abra o formulario de redefinicao e crie uma nova senha forte.');
  });

  it('raises a clear error when ULTRAZEND_API_KEY contains an AI agent key', async () => {
    process.env.FRONTEND_URL = 'https://metalgest.com.br';
    process.env.ULTRAZEND_API_KEY = 'uai_test';
    process.env.ULTRAZEND_FROM_EMAIL = 'noreply@metalgest.com.br';

    mockedPrisma.outboundEmail.create.mockResolvedValue({ id: 'outbound-1' });

    await expect(
      emailService.sendPasswordResetEmail({
        userId: 'user-1',
        toEmail: 'admin@metalgest.com',
        recipientName: 'Admin',
        token: 'reset-token',
      })
    ).rejects.toMatchObject<AppError>({
      message:
        'UltraZend AI Agent key cannot be used for transactional email. Configure ULTRAZEND_API_KEY or ULTRAZEND_ACCESS_TOKEN.',
      code: 'EMAIL_SERVICE_UNAVAILABLE',
    });
  });
});
