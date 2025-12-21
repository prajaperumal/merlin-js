import { describe, it, expect } from 'vitest';
import app from './index';

describe('API Server', () => {
    it('should have a working health check', async () => {
        const res = await app.request('/health');
        expect(res.status).toBe(200);
        const body = (await res.json()) as { status: string };
        expect(body.status).toBe('ok');
    });

    it('should return 401 for protected routes without auth', async () => {
        const res = await app.request('/api/circles');
        expect(res.status).toBe(401);
    });
});
