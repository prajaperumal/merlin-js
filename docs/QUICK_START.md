# Quick Start Guide

## Prerequisites Check

Before starting, make sure you have:
- [ ] Node.js 18+ installed (`node --version`)
- [ ] PostgreSQL running (`psql --version`)
- [ ] TMDB API key from https://www.themoviedb.org/settings/api
- [ ] Google OAuth credentials from https://console.cloud.google.com/

## Setup Steps

### 1. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env
```

Edit `.env` and fill in your credentials:
```env
TMDB_API_KEY=your_tmdb_api_key_here
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback
DATABASE_URL=postgresql://localhost:5432/merlin
SESSION_SECRET=generate_a_random_secret_here
```

### 2. Install Dependencies

```bash
npm install
```

This will install dependencies for both server and client workspaces.

### 3. Database Setup

```bash
# Navigate to server directory
cd server

# Push the Prisma schema to your database
npm run db:push

# (Optional) Open Prisma Studio to view your database
npm run db:studio
```

### 4. Start Development Servers

**Option A: Run both servers at once (recommended)**
```bash
# From the root directory
npm run dev
```

**Option B: Run servers separately**

Terminal 1 - Backend:
```bash
cd server
npm run dev
```

Terminal 2 - Frontend:
```bash
cd client
npm run dev
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Health Check**: http://localhost:8000/health

## First Steps

1. **Sign in with Google**
   - Click "Sign in with Google" on the home page
   - Authorize the application
   - You'll be redirected back

2. **Search for movies**
   - Use the search bar to find movies
   - Try "Inception", "The Matrix", or your favorite movie

3. **Create a watchstream**
   - Go to "Watchstreams" in the sidebar
   - Click "Create Watchstream"
   - Name it something like "To Watch" or "Favorites"

4. **Create a circle**
   - Go to "Circles" in the sidebar
   - Click "Create Circle"
   - Add a name and description

## Troubleshooting

### Database Connection Issues

If you see database connection errors:
```bash
# Make sure PostgreSQL is running
brew services start postgresql  # macOS with Homebrew
sudo service postgresql start   # Linux

# Create the database if it doesn't exist
createdb merlin
```

### Port Already in Use

If port 3000 or 8000 is already in use:
```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9  # Frontend
lsof -ti:8000 | xargs kill -9  # Backend
```

### Google OAuth Issues

Make sure in Google Cloud Console:
1. OAuth consent screen is configured
2. Authorized redirect URIs includes: `http://localhost:3000/auth/callback`
3. OAuth 2.0 Client ID is created for "Web application"

### TMDB API Issues

- Verify your API key is valid at https://www.themoviedb.org/settings/api
- Check you're using the "API Read Access Token" (v4) or "API Key" (v3)

## Development Commands

```bash
# Root directory
npm run dev              # Run both servers
npm run build            # Build both projects

# Server directory
npm run dev              # Start dev server with hot reload
npm run build            # Build for production
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:migrate       # Create migration
npm run db:studio        # Open Prisma Studio

# Client directory
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build
```

## Next Steps

- Read [README.md](./README.md) for full documentation
- Check [walkthrough.md](./walkthrough.md) for architecture details
- Explore the API at http://localhost:8000/health

Enjoy using Merlin! 🎬
