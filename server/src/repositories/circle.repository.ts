import { prisma } from '../config/database.js';

export class CircleRepository {
    /**
     * Get all circles for a user (owned and member)
     */
    async getUserCircles(userId: number) {
        const [owned, memberships] = await Promise.all([
            // Circles owned by user
            prisma.circle.findMany({
                where: { ownerUserId: userId },
                include: {
                    members: {
                        where: { status: 'accepted' },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            // Circles where user is a member
            prisma.circleMember.findMany({
                where: {
                    userId,
                    status: 'accepted',
                },
                include: {
                    circle: {
                        include: {
                            members: {
                                where: { status: 'accepted' },
                            },
                        },
                    },
                },
                orderBy: { joinedAt: 'desc' },
            }),
        ]);

        return {
            owned: owned.map(circle => ({
                ...circle,
                memberCount: circle.members.length + 1, // +1 for owner
            })),
            member: memberships.map(m => ({
                ...m.circle,
                memberCount: m.circle.members.length + 1,
            })),
        };
    }

    /**
     * Get pending invitations for a user
     */
    async getPendingInvitations(userId: number) {
        return prisma.circleMember.findMany({
            where: {
                userId,
                status: 'pending',
            },
            include: {
                circle: true,
            },
            orderBy: { invitedAt: 'desc' },
        });
    }

    /**
     * Get circle details with members
     */
    async getCircleDetails(circleId: number) {
        const circle = await prisma.circle.findUnique({
            where: { id: circleId },
            include: {
                owner: true,
                members: {
                    where: { status: 'accepted' },
                    include: {
                        user: true,
                    },
                },
            },
        });

        if (!circle) return null;

        return {
            ...circle,
            members: [
                // Owner first
                {
                    id: circle.owner.id,
                    email: circle.owner.email,
                    name: circle.owner.name,
                    picture: circle.owner.picture,
                    isOwner: true,
                },
                // Then members
                ...circle.members.map(m => ({
                    id: m.user.id,
                    email: m.user.email,
                    name: m.user.name,
                    picture: m.user.picture,
                    isOwner: false,
                })),
            ],
        };
    }

    /**
     * Create a new circle
     */
    async create(ownerUserId: number, name: string, description?: string) {
        return prisma.circle.create({
            data: {
                ownerUserId,
                name,
                description,
            },
        });
    }

    /**
     * Delete a circle
     */
    async delete(circleId: number) {
        return prisma.circle.delete({
            where: { id: circleId },
        });
    }

    /**
     * Invite a member to a circle
     */
    async inviteMember(circleId: number, userId: number, invitedBy: number) {
        try {
            return await prisma.circleMember.create({
                data: {
                    circleId,
                    userId,
                    invitedBy,
                    status: 'pending',
                },
            });
        } catch (error: any) {
            if (error.code === 'P2002') {
                return null; // User already invited
            }
            throw error;
        }
    }

    /**
     * Accept invitation
     */
    async acceptInvitation(circleId: number, userId: number) {
        return prisma.circleMember.updateMany({
            where: {
                circleId,
                userId,
                status: 'pending',
            },
            data: {
                status: 'accepted',
                joinedAt: new Date(),
            },
        });
    }

    /**
     * Decline invitation
     */
    async declineInvitation(circleId: number, userId: number) {
        return prisma.circleMember.deleteMany({
            where: {
                circleId,
                userId,
                status: 'pending',
            },
        });
    }

    /**
     * Remove member from circle
     */
    async removeMember(circleId: number, userId: number) {
        return prisma.circleMember.deleteMany({
            where: {
                circleId,
                userId,
            },
        });
    }
}
