import { prisma } from '../config/database.js';

export class NotificationRepository {
    /**
     * Get all notifications for a user
     */
    async getUserNotifications(userId: number, limit = 50) {
        return prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }

    /**
     * Get unread notification count
     */
    async getUnreadCount(userId: number) {
        return prisma.notification.count({
            where: {
                userId,
                read: false,
            },
        });
    }

    /**
     * Create a notification
     */
    async create(
        userId: number,
        type: string,
        title: string,
        message: string,
        metadata?: any,
        link?: string
    ) {
        return prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                metadata: metadata || null,
                link,
            },
        });
    }

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId: number, userId: number) {
        return prisma.notification.updateMany({
            where: {
                id: notificationId,
                userId, // Ensure user owns this notification
            },
            data: {
                read: true,
            },
        });
    }

    /**
     * Mark all notifications as read for a user
     */
    async markAllAsRead(userId: number) {
        return prisma.notification.updateMany({
            where: {
                userId,
                read: false,
            },
            data: {
                read: true,
            },
        });
    }

    /**
     * Delete a notification
     */
    async delete(notificationId: number, userId: number) {
        return prisma.notification.deleteMany({
            where: {
                id: notificationId,
                userId,
            },
        });
    }

    /**
     * Helper: Create circle invite notification
     */
    async createCircleInviteNotification(userId: number, circleName: string, inviterName: string, circleId: number) {
        return this.create(
            userId,
            'circle_invite',
            'Circle Invitation',
            `${inviterName} invited you to join "${circleName}"`,
            { circleName, inviterName, circleId },
            `/circles/${circleId}`
        );
    }

    /**
     * Helper: Create invite accepted notification
     */
    async createInviteAcceptedNotification(userId: number, circleName: string, accepterName: string, circleId: number) {
        return this.create(
            userId,
            'invite_accepted',
            'Invitation Accepted',
            `${accepterName} joined your circle "${circleName}"`,
            { circleName, accepterName, circleId },
            `/circles/${circleId}`
        );
    }

    /**
     * Helper: Create movie recommended notification
     */
    async createMovieRecommendedNotification(
        userId: number,
        movieTitle: string,
        recommenderName: string,
        circleName: string,
        circleId: number
    ) {
        return this.create(
            userId,
            'movie_recommended',
            'New Movie Recommendation',
            `${recommenderName} recommended "${movieTitle}" in "${circleName}"`,
            { movieTitle, recommenderName, circleName, circleId },
            `/circles/${circleId}`
        );
    }

    /**
     * Helper: Create comment added notification
     */
    async createCommentNotification(
        userId: number,
        commenterName: string,
        movieTitle: string,
        circleName: string,
        circleId: number
    ) {
        return this.create(
            userId,
            'comment_added',
            'New Comment',
            `${commenterName} commented on "${movieTitle}" in "${circleName}"`,
            { commenterName, movieTitle, circleName, circleId },
            `/circles/${circleId}`
        );
    }
}
