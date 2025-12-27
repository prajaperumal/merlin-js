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
        // First, check if a user with this googleId exists
        const existingByGoogleId = await prisma.user.findUnique({
            where: { googleId: data.googleId },
        });

        if (existingByGoogleId) {
            // Update the existing user
            return prisma.user.update({
                where: { googleId: data.googleId },
                data: {
                    name: data.name,
                    picture: data.picture,
                    lastLogin: new Date(),
                },
            });
        }

        // Check if a user with this email exists (but different googleId)
        const existingByEmail = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingByEmail) {
            // Update the existing user's googleId (user logging in with a different Google method)
            return prisma.user.update({
                where: { email: data.email },
                data: {
                    googleId: data.googleId,
                    name: data.name,
                    picture: data.picture,
                    lastLogin: new Date(),
                },
            });
        }

        // Create a new user
        return prisma.user.create({
            data: {
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
