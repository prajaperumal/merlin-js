# Merlin 🎬

A modern movie search and discovery application built with TypeScript, Hono, and React.

## Features

- 🎥 **Movie Search**: Fast movie search powered by TMDB API with intelligent caching
- 🔐 **Google OAuth**: Secure authentication with Google Sign-In
- 📺 **Watchstreams**: Create and manage movie collections with status tracking
- 👥 **Circles**: Friend groups for sharing movie recommendations
- ⚡ **Lightning Fast**: Built with Hono for blazing-fast API responses
- 🎨 **Modern UI**: Polished dark theme with smooth animations and glassmorphism

## Tech Stack

### Backend
- **Hono**: Ultra-lightweight TypeScript web framework
- **Prisma**: Type-safe database ORM
- **PostgreSQL**: Robust relational database
- **Google OAuth**: Secure authentication

### Frontend
- **React 18**: Modern UI library
- **TypeScript**: Type-safe development
- **Vite**: Lightning-fast build tool
- **CSS Modules**: Scoped styling with design tokens

## Getting Started

### Two Ways to Run Merlin

#### Option 1: Docker (Recommended) 🐳

The easiest way to run Merlin with all dependencies included.

**Prerequisites:**
- Docker Desktop (or Docker Engine + Docker Compose)
- TMDB API key
- Google OAuth credentials

See [DOCKER.md](DOCKER.md) for complete Docker setup instructions.

**Quick Start:**
```bash
# 1. Copy and configure environment
cp .env.docker .env.docker.local
# Edit .env.docker.local with your API keys

# 2. Start the application
docker-compose --env-file .env.docker.local up -d

# 3. Access at http://localhost:8000
```

#### Option 2: Local Development

**Prerequisites:**
- Node.js 18+ (or use nvm/fnm)
- PostgreSQL database
- TMDB API key
- Google OAuth credentials

### Installation

1. Clone the repository:
```bash
git clone <repo-url>
cd merlin-js
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
- `TMDB_API_KEY`: Get from [TMDB](https://www.themoviedb.org/settings/api)
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: From [Google Cloud Console](https://console.cloud.google.com/)
- `DATABASE_URL`: Your PostgreSQL connection string

4. Set up the database:
```bash
cd server
npm run db:push
```

5. Start the development servers:
```bash
# From root directory
npm run dev
```

This will start:
- Backend API at http://localhost:8000
- Frontend at http://localhost:3000

## Project Structure

```
merlin-js/
├── server/                 # Backend (Hono API)
│   ├── src/
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── repositories/  # Data access
│   │   ├── middleware/    # Express middleware
│   │   └── config/        # Configuration
│   └── prisma/
│       └── schema.prisma  # Database schema
│
├── client/                # Frontend (React)
│   ├── src/
│   │   ├── pages/        # Page components
│   │   ├── components/   # Reusable components
│   │   ├── contexts/     # React contexts
│   │   ├── services/     # API client
│   │   └── styles/       # Global styles
│   └── public/
│
└── package.json          # Root workspace config
```

## Development

### Running the Backend

```bash
cd server
npm run dev
```

### Running the Frontend

```bash
cd client
npm run dev
```

### Database Commands

```bash
cd server

# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Create migration
npm run db:migrate

# Open Prisma Studio
npm run db:studio
```

## API Endpoints

### Authentication
- `GET /api/auth/google/url` - Get OAuth URL
- `POST /api/auth/google/callback` - Handle OAuth callback
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Movies
- `GET /api/movies/search?q=query` - Search movies
- `GET /api/movies/:id` - Get movie details

### Watchstreams
- `GET /api/watchstreams` - Get user's watchstreams
- `POST /api/watchstreams` - Create watchstream
- `PUT /api/watchstreams/:id` - Rename watchstream
- `DELETE /api/watchstreams/:id` - Delete watchstream
- `GET /api/watchstreams/:id/movies?status=backlog` - Get movies by status
- `POST /api/watchstreams/:id/movies` - Add movie
- `DELETE /api/watchstreams/:id/movies/:movieId` - Remove movie
- `PUT /api/watchstreams/:id/movies/:movieId` - Update movie status

### Circles
- `GET /api/circles` - Get user's circles
- `POST /api/circles` - Create circle
- `POST /api/circles/:id/invite` - Invite member
- `POST /api/circles/:id/accept` - Accept invitation
- `DELETE /api/circles/:id` - Delete circle

## Design System

The app uses a comprehensive design system with CSS variables:

- **Colors**: Dark theme with vibrant blue primary color
- **Typography**: Inter font family with responsive sizes
- **Spacing**: Consistent spacing scale
- **Animations**: Smooth transitions and micro-interactions
- **Components**: Reusable UI components with variants

## License

MIT
