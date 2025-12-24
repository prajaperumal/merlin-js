# Docker Setup for Merlin

This guide explains how to run Merlin using Docker containers.

## Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- Your TMDB API key
- Your Google OAuth credentials

## Quick Start

### 1. Production Setup

#### Step 1: Configure Environment Variables

Create a `.env.docker.local` file from the template:

```bash
cp .env.docker .env.docker.local
```

Edit `.env.docker.local` and fill in your actual values:
- `TMDB_API_KEY`: Your TMDB API key
- `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth Client Secret
- `SESSION_SECRET`: A random string (minimum 32 characters)

#### Step 2: Build and Run

```bash
# Load environment variables and start services
docker-compose --env-file .env.docker.local up -d

# Or build from scratch
docker-compose --env-file .env.docker.local up --build -d
```

#### Step 3: Access the Application

- **Application**: http://localhost:8000
- **Database**: localhost:5432 (user: merlin, password: merlin_password)

### 2. Development Setup (with Hot Reload)

For development with hot reload:

```bash
# Create environment file
cp .env.docker .env.docker.local
# Edit .env.docker.local with your credentials

# Start development containers
docker-compose -f docker-compose.dev.yml --env-file .env.docker.local up
```

Access:
- **Client**: http://localhost:3000
- **Server API**: http://localhost:8000
- **Database**: localhost:5432

## Docker Commands

### Start Services

```bash
# Start in background (production)
docker-compose --env-file .env.docker.local up -d

# Start in foreground (see logs)
docker-compose --env-file .env.docker.local up

# Start development services
docker-compose -f docker-compose.dev.yml --env-file .env.docker.local up
```

### Stop Services

```bash
# Stop services (production)
docker-compose down

# Stop and remove volumes (deletes database data)
docker-compose down -v

# Stop development services
docker-compose -f docker-compose.dev.yml down
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres
```

### Database Management

```bash
# Run Prisma migrations
docker-compose exec app sh -c "cd /app/server && npx prisma migrate deploy"

# Run Prisma Studio (database GUI)
docker-compose exec app sh -c "cd /app/server && npx prisma studio"

# Seed the database
docker-compose exec app sh -c "cd /app/server && npx prisma db seed"

# Access PostgreSQL CLI
docker-compose exec postgres psql -U merlin -d merlin
```

### Rebuild Containers

```bash
# Rebuild after code changes (production)
docker-compose build
docker-compose up -d

# Force rebuild without cache
docker-compose build --no-cache
```

## Architecture

### Production Setup (`docker-compose.yml`)

- **Multi-stage build**: Optimized Docker image with separate build and runtime stages
- **PostgreSQL**: Dedicated container for the database
- **App Container**: Runs both the API server and serves the built client
- **Health checks**: Automatic health monitoring for all services
- **Persistent data**: Database data stored in Docker volumes

### Development Setup (`docker-compose.dev.yml`)

- **Hot reload**: File changes automatically reload the application
- **Volume mounts**: Source code mounted for live editing
- **Separate containers**: Client and server run in separate containers
- **Development mode**: Node.js development mode with debugging support

## Environment Variables

Required environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `TMDB_API_KEY` | TMDB API key for movie data | `your_api_key_here` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | `GOCSPX-xxx` |
| `GOOGLE_REDIRECT_URI` | OAuth callback URL | `http://localhost:8000/auth/callback` |
| `SESSION_SECRET` | Secret for session encryption | Random 32+ character string |
| `DATABASE_URL` | PostgreSQL connection string | Auto-configured in Docker |
| `PORT` | Server port | `8000` |
| `NODE_ENV` | Node environment | `production` or `development` |

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Restart PostgreSQL
docker-compose restart postgres
```

### Application Won't Start

```bash
# Check application logs
docker-compose logs app

# Rebuild the application
docker-compose build --no-cache app
docker-compose up -d app
```

### Reset Everything

```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Start fresh
docker-compose --env-file .env.docker.local up --build -d
```

### Port Already in Use

If port 8000 or 5432 is already in use:

```bash
# Edit docker-compose.yml and change the port mappings
# For example: "8001:8000" instead of "8000:8000"
```

## Production Deployment

For production deployment:

1. Use environment-specific configuration
2. Set strong passwords for PostgreSQL
3. Use proper secrets management (e.g., Docker secrets, Kubernetes secrets)
4. Configure HTTPS/SSL termination (use a reverse proxy like Nginx)
5. Set up monitoring and logging
6. Configure backup strategy for PostgreSQL data

Example with custom PostgreSQL password:

```yaml
# In docker-compose.yml
services:
  postgres:
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}  # From environment

  app:
    environment:
      DATABASE_URL: postgresql://merlin:${POSTGRES_PASSWORD}@postgres:5432/merlin
```

## Maintenance

### Backup Database

```bash
# Create backup
docker-compose exec postgres pg_dump -U merlin merlin > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U merlin merlin < backup.sql
```

### Update Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose --env-file .env.docker.local up --build -d

# Run migrations if needed
docker-compose exec app sh -c "cd /app/server && npx prisma migrate deploy"
```

## Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
