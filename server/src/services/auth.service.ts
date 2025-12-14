import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env.js';
import { UserRepository } from '../repositories/user.repository.js';

export class AuthService {
    private oauth2Client: OAuth2Client;
    private userRepository: UserRepository;

    constructor() {
        this.oauth2Client = new OAuth2Client(
            env.GOOGLE_CLIENT_ID,
            env.GOOGLE_CLIENT_SECRET,
            env.GOOGLE_REDIRECT_URI
        );
        this.userRepository = new UserRepository();
    }

    /**
     * Get Google OAuth authorization URL
     */
    getAuthorizationUrl(): string {
        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/userinfo.email',
                'https://www.googleapis.com/auth/userinfo.profile',
            ],
        });
    }

    /**
     * Handle OAuth callback and authenticate user
     */
    async authenticateWithCode(code: string) {
        try {
            // Exchange code for tokens
            const { tokens } = await this.oauth2Client.getToken(code);
            this.oauth2Client.setCredentials(tokens);

            // Get user info from Google
            const ticket = await this.oauth2Client.verifyIdToken({
                idToken: tokens.id_token!,
                audience: env.GOOGLE_CLIENT_ID,
            });

            const payload = ticket.getPayload();
            if (!payload) {
                throw new Error('Failed to get user payload from Google');
            }

            // Create or update user in database
            const user = await this.userRepository.createOrUpdateUser({
                googleId: payload.sub,
                email: payload.email!,
                name: payload.name || null,
                picture: payload.picture || null,
            });

            return user;
        } catch (error) {
            console.error('Error authenticating with Google:', error);
            throw new Error('Authentication failed');
        }
    }

    /**
     * Get user by ID
     */
    async getUserById(userId: number) {
        return this.userRepository.getUserById(userId);
    }
}
