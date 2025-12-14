import { Hono } from 'hono';
import { setCookie, deleteCookie } from 'hono/cookie';
import { AuthService } from '../services/auth.service.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import type { AuthSession } from '../types/index.js';

const auth = new Hono();
const authService = new AuthService();

// Get Google OAuth URL
auth.get('/google/url', (c) => {
    const url = authService.getAuthorizationUrl();
    return c.json({ url });
});

// Handle OAuth callback
auth.post('/google/callback', async (c) => {
    const { code } = await c.req.json();

    if (!code) {
        return c.json({ error: 'Authorization code required' }, 400);
    }

    try {
        const user = await authService.authenticateWithCode(code);

        // Create session
        const session: AuthSession = {
            userId: user.id,
            email: user.email,
            name: user.name,
            picture: user.picture,
        };

        // Set session cookie
        setCookie(c, 'session', encodeURIComponent(JSON.stringify(session)), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/',
        });

        return c.json({ user });
    } catch (error) {
        console.error('Auth error:', error);
        return c.json({ error: 'Authentication failed' }, 401);
    }
});

// Get current user
auth.get('/me', authMiddleware, async (c) => {
    const session = c.get('user') as AuthSession;
    const user = await authService.getUserById(session.userId);

    if (!user) {
        return c.json({ error: 'User not found' }, 404);
    }

    return c.json({ user });
});

// Logout
auth.post('/logout', (c) => {
    deleteCookie(c, 'session');
    return c.json({ success: true });
});

export default auth;
