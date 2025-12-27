import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { NotificationRepository } from '../repositories/notification.repository.js';
import type { AuthSession } from '../types/index.js';

type Variables = {
    user: AuthSession;
};

const notifications = new Hono<{ Variables: Variables }>();
const notificationRepo = new NotificationRepository();

// All routes require authentication
notifications.use('/*', authMiddleware);

// Get user's notifications
notifications.get('/', async (c) => {
    const session = c.get('user');
    const limit = parseInt(c.req.query('limit') || '50');

    const userNotifications = await notificationRepo.getUserNotifications(session.userId, limit);
    const unreadCount = await notificationRepo.getUnreadCount(session.userId);

    return c.json({
        notifications: userNotifications,
        unreadCount,
    });
});

// Get unread count only
notifications.get('/unread-count', async (c) => {
    const session = c.get('user');
    const count = await notificationRepo.getUnreadCount(session.userId);

    return c.json({ unreadCount: count });
});

// Mark notification as read
notifications.post('/:id/read', async (c) => {
    const session = c.get('user');
    const id = parseInt(c.req.param('id'));

    await notificationRepo.markAsRead(id, session.userId);
    return c.json({ success: true });
});

// Mark all notifications as read
notifications.post('/read-all', async (c) => {
    const session = c.get('user');

    await notificationRepo.markAllAsRead(session.userId);
    return c.json({ success: true });
});

// Delete notification
notifications.delete('/:id', async (c) => {
    const session = c.get('user');
    const id = parseInt(c.req.param('id'));

    await notificationRepo.delete(id, session.userId);
    return c.json({ success: true });
});

export default notifications;
