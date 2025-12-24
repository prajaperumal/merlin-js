import { Hono } from 'hono';
import { setCookie, deleteCookie } from 'hono/cookie';
import { AuthService } from '../services/auth.service.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { UserRepository } from '../repositories/user.repository.js';
import type { AuthSession } from '../types/index.js';

const auth = new Hono();
const authService = new AuthService();

// Get Google OAuth URL
auth.get('/google/url', (c) => {
    const url = authService.getAuthorizationUrl();
    return c.json({ url });
});

// Handle OAuth callback from Google (GET redirect)
auth.get('/callback', async (c) => {
    const code = c.req.query('code');
    const error = c.req.query('error');

    if (error) {
        console.error('OAuth error:', error);
        return c.redirect('/?error=' + encodeURIComponent(error));
    }

    if (!code) {
        return c.redirect('/?error=no_code');
    }

    try {
        console.log('--- Google Callback Start (GET) ---');
        const user = await authService.authenticateWithCode(code);
        console.log('User authenticated:', user.email);

        // Create session
        const session: AuthSession = {
            userId: user.id,
            email: user.email,
            name: user.name,
            picture: user.picture,
        };

        // Set session cookie
        const cookieValue = encodeURIComponent(JSON.stringify(session));
        setCookie(c, 'session', cookieValue, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/',
        });

        console.log('Session cookie set for user:', user.email);
        console.log('--- Google Callback Success ---');

        // Redirect to home page after successful login
        return c.redirect('/');
    } catch (error) {
        console.error('--- Google Callback Error ---');
        console.error('Auth error detail:', error);
        const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
        return c.redirect('/?error=' + encodeURIComponent(errorMessage));
    }
});

// Handle OAuth callback (POST - for API clients)
auth.post('/google/callback', async (c) => {
    const { code } = await c.req.json();

    if (!code) {
        return c.json({ error: 'Authorization code required' }, 400);
    }

    try {
        console.log('--- Google Callback Start (POST) ---');
        const user = await authService.authenticateWithCode(code);
        console.log('User authenticated:', user.email);

        // Create session
        const session: AuthSession = {
            userId: user.id,
            email: user.email,
            name: user.name,
            picture: user.picture,
        };

        // Set session cookie
        const cookieValue = encodeURIComponent(JSON.stringify(session));
        setCookie(c, 'session', cookieValue, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/',
        });

        console.log('Session cookie set for user:', user.email);
        console.log('--- Google Callback Success ---');

        return c.json({ user });
    } catch (error) {
        console.error('--- Google Callback Error ---');
        console.error('Auth error detail:', error);
        const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
        return c.json({ error: errorMessage }, 401);
    }
});

// Get current user
auth.get('/me', authMiddleware, async (c) => {
    try {
        const session = (c as any).get('user') as AuthSession;
        console.log('--- auth/me: Checking user in DB for', session.email, '---');

        const user = await authService.getUserById(session.userId);

        if (!user) {
            console.error('--- auth/me: User not found in DB for session ID:', session.userId, '---');
            return c.json({ error: 'User not found' }, 404);
        }

        console.log('--- auth/me: User found, returning details ---');
        return c.json({ user });
    } catch (error) {
        console.error('--- auth/me: Unexpected error ---', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        return c.json({ error: errorMessage }, 500);
    }
});

// Logout
auth.post('/logout', (c) => {
    deleteCookie(c, 'session');
    return c.json({ success: true });
});

// Test-only login (to bypass Google OAuth during E2E tests)
if (process.env.NODE_ENV !== 'production') {
    auth.post('/test-login', async (c) => {
        const { email, name } = await c.req.json();

        // Mock user data
        const user = await new UserRepository().createOrUpdateUser({
            googleId: `test-${email}`,
            email: email,
            name: name || 'Test User',
            picture: 'https://via.placeholder.com/150',
        });

        const session: AuthSession = {
            userId: user.id,
            email: user.email,
            name: user.name,
            picture: user.picture,
        };

        const cookieValue = encodeURIComponent(JSON.stringify(session));
        setCookie(c, 'session', cookieValue, {
            httpOnly: true,
            secure: false, // development/test
            sameSite: 'Lax',
            maxAge: 60 * 60 * 24 * 30,
            path: '/',
        });

        return c.json({ user });
    });
}

export default auth;
