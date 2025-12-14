import { prisma } from '../config/database.js';

export class UserRepository {
    /**
     * Create or update user from Google OAuth
     */
    async createOrUpdateUser(data: {
        googleId: string;
        email: string;
        name: string | null;
        picture: string | null;
    }) {
        return prisma.user.upsert({
            where: { googleId: data.googleId },
            update: {
                name: data.name,
                picture: data.picture,
                lastLogin: new Date(),
            },
            create: {
                googleId: data.googleId,
                email: data.email,
                name: data.name,
                picture: data.picture,
                lastLogin: new Date(),
            },
        });
    }

    /**
     * Get user by ID
     */
    async getUserById(id: number) {
        return prisma.user.findUnique({
            where: { id },
        });
    }

    /**
     * Get user by Google ID
     */
    async getUserByGoogleId(googleId: string) {
        return prisma.user.findUnique({
            where: { googleId },
        });
    }

    /**
     * Get user by email
     */
    async getUserByEmail(email: string) {
        return prisma.user.findUnique({
            where: { email },
        });
    }
}
