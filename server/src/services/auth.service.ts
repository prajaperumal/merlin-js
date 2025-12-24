import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env.js';
import { UserRepository } from '../repositories/user.repository.js';
import { CircleRepository } from '../repositories/circle.repository.js';

export class AuthService {
    private oauth2Client: OAuth2Client;
    private userRepository: UserRepository;
    private circleRepository: CircleRepository;

    constructor() {
        console.log('--- AuthService Initializing ---');
        console.log('Redirect URI:', env.GOOGLE_REDIRECT_URI);
        this.oauth2Client = new OAuth2Client(
            env.GOOGLE_CLIENT_ID,
            env.GOOGLE_CLIENT_SECRET,
            env.GOOGLE_REDIRECT_URI
        );
        this.userRepository = new UserRepository();
        this.circleRepository = new CircleRepository();
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
            console.log('Exchanging code for tokens...');
            // Exchange code for tokens
            const { tokens } = await this.oauth2Client.getToken(code);
            this.oauth2Client.setCredentials(tokens);
            console.log('Tokens received successfully');

            // Get user info from Google
            console.log('Verifying ID token...');
            if (!tokens.id_token) {
                console.error('No ID token in response - tokens:', JSON.stringify(tokens, null, 2));
                throw new Error('No ID token returned from Google');
            }
            const ticket = await this.oauth2Client.verifyIdToken({
                idToken: tokens.id_token,
                audience: env.GOOGLE_CLIENT_ID,
            });

            const payload = ticket.getPayload();
            if (!payload) {
                throw new Error('Failed to get user payload from Google');
            }

            console.log('User payload received:', payload.email);

            // Create or update user in database
            console.log('Creating/updating user in database...');
            const user = await this.userRepository.createOrUpdateUser({
                googleId: payload.sub,
                email: payload.email!,
                name: payload.name || null,
                picture: payload.picture || null,
            });

            console.log('User created/updated successfully:', user.email);

            // Resolve any pending external invitations for this email
            await this.circleRepository.resolvePendingInvitations(user.email, user.id);

            return user;
        } catch (error) {
            console.error('!!! Error authenticating with Google !!!');
            console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
            console.error('Error message:', error instanceof Error ? error.message : String(error));
            console.error('Full error:', error);

            // Re-throw with the actual error message
            if (error instanceof Error) {
                throw error;
            }
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
