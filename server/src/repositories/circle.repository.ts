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
            // First check if already a member or invited
            const existing = await prisma.circleMember.findUnique({
                where: {
                    circleId_userId: { circleId, userId }
                }
            });

            if (existing) return null;

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
     * Create an external invitation (for users not in the system)
     */
    async createExternalInvitation(circleId: number, email: string, invitedBy: number) {
        try {
            return await (prisma as any).circleInvitation.create({
                data: {
                    circleId,
                    email,
                    invitedBy,
                },
            });
        } catch (error: any) {
            if (error.code === 'P2002') {
                return null; // Already invited
            }
            throw error;
        }
    }

    /**
     * Get all external invitations for an email
     */
    async getExternalInvitationsByEmail(email: string) {
        return (prisma as any).circleInvitation.findMany({
            where: { email },
            include: {
                circle: true,
            },
        });
    }

    /**
     * Delete an external invitation
     */
    async deleteExternalInvitation(invitationId: number) {
        return (prisma as any).circleInvitation.delete({
            where: { id: invitationId },
        });
    }

    /**
     * Resolve pending external invitations for a new user
     */
    async resolvePendingInvitations(email: string, userId: number) {
        // Find all external invitations for this email
        const invitations = await (prisma as any).circleInvitation.findMany({
            where: { email }
        });

        if (invitations.length === 0) return;

        // Create CircleMember entries
        await prisma.circleMember.createMany({
            data: invitations.map((inv: any) => ({
                circleId: inv.circleId,
                userId: userId,
                invitedBy: inv.invitedBy,
                status: 'pending'
            })),
            skipDuplicates: true
        });

        // Delete the external invitations
        await (prisma as any).circleInvitation.deleteMany({
            where: { email }
        });

        console.log(`Resolved ${invitations.length} invitations for ${email}`);
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

    /**
     * Get all movies in a circle's watchstream
     */
    async getCircleMovies(circleId: number) {
        const circleMovies = await prisma.circleMovie.findMany({
            where: { circleId },
            include: {
                movie: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        picture: true,
                    },
                },
            },
            orderBy: { addedAt: 'desc' },
        });

        // Transform to flatten movie data
        return circleMovies.map(cm => ({
            ...cm.movie,
            circleMovieId: cm.id,
            streamingPlatforms: cm.streamingPlatforms,
            recommendation: cm.recommendation,
            addedAt: cm.addedAt,
            addedBy: cm.user,
        }));
    }

    /**
     * Add movie to circle watchstream
     */
    async addMovieToCircle(circleId: number, movieTmdbId: number, userId: number, recommendation?: string, streamingPlatforms?: any) {
        try {
            return await prisma.circleMovie.create({
                data: {
                    circleId,
                    movieTmdbId,
                    addedBy: userId,
                    recommendation,
                    streamingPlatforms: streamingPlatforms || null,
                },
            });
        } catch (error: any) {
            if (error.code === 'P2002') {
                return null; // Movie already in circle
            }
            throw error;
        }
    }

    /**
     * Remove movie from circle watchstream
     */
    async removeMovieFromCircle(circleId: number, movieTmdbId: number) {
        return prisma.circleMovie.deleteMany({
            where: {
                circleId,
                movieTmdbId,
            },
        });
    }

    /**
     * Add a comment to a circle movie
     */
    async addComment(circleMovieId: number, userId: number, content: string) {
        return prisma.circleMovieComment.create({
            data: {
                circleMovieId,
                userId,
                content,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        picture: true,
                    },
                },
            },
        });
    }

    /**
     * Get comments for a circle movie
     */
    async getComments(circleMovieId: number) {
        return prisma.circleMovieComment.findMany({
            where: { circleMovieId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        picture: true,
                    },
                },
            },
            orderBy: { createdAt: 'asc' },
        });
    }
}
