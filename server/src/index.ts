import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { env } from './config/env.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import auth from './routes/auth.js';
import movies from './routes/movies.js';
import watchstreams from './routes/watchstreams.js';
import circles from './routes/circles.js';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use('*', errorMiddleware);

// Routes
app.route('/api/auth', auth);
app.route('/api/movies', movies);
app.route('/api/watchstreams', watchstreams);
app.route('/api/circles', circles);

// Health check
app.get('/health', (c) => {
    return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.notFound((c) => {
    return c.json({ error: 'Not found' }, 404);
});

console.log(`🚀 Server starting on port ${env.PORT}`);

serve({
    fetch: app.fetch,
    port: env.PORT,
});
