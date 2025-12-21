import type { Context, Next } from 'hono';
import { getCookie } from 'hono/cookie';
import type { AuthSession } from '../types/index.js';

export async function authMiddleware(c: Context, next: Next) {
    const sessionCookie = getCookie(c, 'session');

    if (!sessionCookie) {
        console.log('--- Auth Middleware: No session cookie found ---');
        return c.json({ error: 'Unauthorized' }, 401);
    }

    try {
        // Parse session data
        const session: AuthSession = JSON.parse(decodeURIComponent(sessionCookie));
        console.log('--- Auth Middleware: Valid session for', session.email, '---');

        // Attach user to context
        (c as any).set('user', session);

        await next();
    } catch (error) {
        console.error('--- Auth Middleware: Error parsing session cookie ---', error);
        return c.json({ error: 'Invalid session' }, 401);
    }
}

export function optionalAuthMiddleware(c: Context, next: Next) {
    const sessionCookie = getCookie(c, 'session');

    if (sessionCookie) {
        try {
            const session: AuthSession = JSON.parse(decodeURIComponent(sessionCookie));
            c.set('user', session);
        } catch (error) {
            // Invalid session, but continue anyway
        }
    }

    return next();
}
