import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { env } from './config/env.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('--- Server Environment Loaded ---');
console.log('DATABASE_URL:', env.DATABASE_URL.replace(/:[^:@]+@/, ':****@')); // Hide password

import { errorMiddleware } from './middleware/error.middleware.js';
import auth from './routes/auth.js';
import movies from './routes/movies.js';
import watchstreams from './routes/watchstreams.js';
import circles from './routes/circles.js';
import notifications from './routes/notifications.js';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors({
    origin: (origin) => {
        // Allow requests from the same origin (production) or localhost (development)
        const allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:8000',
        ];

        // In production, if no origin header (same-origin) or if it's an allowed origin
        if (!origin || allowedOrigins.some(allowed => origin.startsWith(allowed))) {
            return origin || '*';
        }

        // Also allow the request origin if it matches the host (for Caddy reverse proxy)
        return origin;
    },
    credentials: true,
}));
app.use('*', errorMiddleware);

// API Routes
app.route('/api/auth', auth);
app.route('/api/movies', movies);
app.route('/api/watchstreams', watchstreams);
app.route('/api/circles', circles);
app.route('/api/notifications', notifications);

// Health check
app.get('/health', (c) => {
    return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files in production
if (env.NODE_ENV === 'production') {
    const clientDistPath = path.resolve(__dirname, '../../client/dist');

    // Serve static assets
    app.use('/assets/*', serveStatic({ root: clientDistPath }));

    // Serve index.html for all non-API routes (SPA fallback)
    app.get('*', serveStatic({
        path: './index.html',
        root: clientDistPath,
    }));
} else {
    // 404 handler for development
    app.notFound((c) => {
        return c.json({ error: 'Not found' }, 404);
    });
}

export default app;

if (process.env.NODE_ENV !== 'test') {
    console.log(`🚀 Server starting on port ${env.PORT}`);
    serve({
        fetch: app.fetch,
        port: env.PORT,
    });
}
