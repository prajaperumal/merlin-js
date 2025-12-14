import type { Context, Next } from 'hono';
import { getCookie } from 'hono/cookie';
import type { AuthSession } from '../types/index.js';

export async function authMiddleware(c: Context, next: Next) {
    const sessionCookie = getCookie(c, 'session');

    if (!sessionCookie) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    try {
        // Parse session data
        const session: AuthSession = JSON.parse(decodeURIComponent(sessionCookie));

        // Attach user to context
        c.set('user', session);

        await next();
    } catch (error) {
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
