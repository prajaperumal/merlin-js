import 'dotenv/config';

export const env = {
    // Server
    PORT: parseInt(process.env.PORT || '8000'),
    NODE_ENV: process.env.NODE_ENV || 'development',

    // Database
    DATABASE_URL: process.env.DATABASE_URL!,

    // TMDB
    TMDB_API_KEY: process.env.TMDB_API_KEY!,
    TMDB_BASE_URL: 'https://api.themoviedb.org/3',
    TMDB_IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',

    // Google OAuth
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/callback',

    // Session
    SESSION_SECRET: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
};

// Validate required env vars
const required = ['DATABASE_URL', 'TMDB_API_KEY', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'];
for (const key of required) {
    if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
}
