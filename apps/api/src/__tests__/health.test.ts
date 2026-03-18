import request from 'supertest';
import app from '@/app';

describe('API health', () => {
  it('returns health status', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      status: 'ok',
    });
    expect(typeof response.body.timestamp).toBe('string');
  });

  it('returns 404 for unknown routes', async () => {
    const response = await request(app).get('/api/route-that-does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body.error?.code).toBe('NOT_FOUND');
  });
});
