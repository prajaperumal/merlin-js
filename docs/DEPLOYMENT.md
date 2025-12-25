# Merlin Deployment Guide

This guide covers various deployment options for the Merlin application.

## Table of Contents

1. [Production Deployment (systemd + Caddy)](#production-deployment)
2. [Cloud Platform Deployment](#cloud-platform-deployment)
3. [Environment Variables](#environment-variables)
4. [Database Setup](#database-setup)
5. [SSL/HTTPS Setup](#ssl-https-setup)

## Production Deployment

### systemd + Caddy (Recommended)

For production deployments on Ubuntu/Debian servers, we recommend using systemd for process management and Caddy for reverse proxy with automatic HTTPS.

See [PRODUCTION_SETUP.md](PRODUCTION_SETUP.md) for complete step-by-step setup instructions.

**Quick Overview:**
1. Set up PostgreSQL database
2. Install Node.js 18+ and Caddy
3. Clone repository and install dependencies
4. Configure environment variables
5. Run deployment script: `./deploy-systemd.sh`
6. Configure Caddy reverse proxy

## Cloud Platform Deployment

### Deploy to Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

1. Fork this repository
2. Create a new project on Railway
3. Add PostgreSQL database service
4. Add this repository
5. Configure environment variables (see below)
6. Deploy!

### Deploy to Render

1. Fork this repository
2. Create new Web Service on Render
3. Create PostgreSQL database
4. Connect repository
5. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `cd server && npx prisma migrate deploy && node dist/index.js`
6. Add environment variables
7. Deploy!

### Deploy to Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login to Fly.io
flyctl auth login

# Launch app
flyctl launch

# Set environment variables
flyctl secrets set TMDB_API_KEY=your_key
flyctl secrets set GOOGLE_CLIENT_ID=your_id
flyctl secrets set GOOGLE_CLIENT_SECRET=your_secret
flyctl secrets set SESSION_SECRET=your_secret
flyctl secrets set DATABASE_URL=your_db_url

# Deploy
flyctl deploy
```

### Deploy to DigitalOcean App Platform

1. Fork this repository
2. Create new App on DigitalOcean
3. Connect repository
4. Add PostgreSQL database
5. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Run Command**: `cd server && npx prisma migrate deploy && node dist/index.js`
6. Add environment variables
7. Deploy!

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `TMDB_API_KEY` | TMDB API key | `abc123...` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `123...apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Secret | `GOCSPX-...` |
| `GOOGLE_REDIRECT_URI` | OAuth redirect URL | `https://yourdomain.com/auth/callback` |
| `SESSION_SECRET` | Session encryption key | Random 32+ chars |
| `DATABASE_URL` | PostgreSQL connection | `postgresql://...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `8000` |
| `NODE_ENV` | Environment | `production` |

### How to Get Credentials

#### TMDB API Key

1. Go to https://www.themoviedb.org/
2. Create account / Sign in
3. Go to Settings > API
4. Request API Key (choose "Developer")
5. Fill in required information
6. Copy your API Key

#### Google OAuth Credentials

1. Go to https://console.cloud.google.com/
2. Create new project (or select existing)
3. Enable Google+ API
4. Go to Credentials > Create Credentials > OAuth 2.0 Client ID
5. Configure OAuth consent screen
6. Create OAuth Client ID:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:8000/auth/callback` (dev) and `https://yourdomain.com/auth/callback` (prod)
7. Copy Client ID and Client Secret

#### Session Secret

Generate a secure random string:

```bash
# Using OpenSSL
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Or just use a random password generator with 32+ characters
```

## Database Setup

### PostgreSQL Hosting Options

1. **Docker** (included in docker-compose.yml)
2. **Supabase** (free tier available) - https://supabase.com
3. **Railway** (free tier available) - https://railway.app
4. **Neon** (free tier available) - https://neon.tech
5. **DigitalOcean Managed Database**
6. **AWS RDS**
7. **Google Cloud SQL**

### Database Migrations

Migrations run automatically on Docker container startup. For manual execution:

```bash
# In Docker container
docker-compose exec app sh -c "cd /app/server && npx prisma migrate deploy"

# Locally
cd server
npx prisma migrate deploy

# Generate Prisma Client (if needed)
npx prisma generate
```

## SSL/HTTPS Setup

### Option 1: Use Cloudflare (Easiest)

1. Add your domain to Cloudflare
2. Point DNS to your server
3. Enable "Full" SSL mode in Cloudflare
4. Cloudflare handles SSL automatically

### Option 2: Use Let's Encrypt with Nginx

1. Use the provided `nginx.conf` template
2. Install Certbot:
```bash
sudo apt-get install certbot python3-certbot-nginx
```

3. Get SSL certificate:
```bash
sudo certbot --nginx -d yourdomain.com
```

4. Auto-renewal is configured automatically

### Option 3: Cloud Platform SSL

Most cloud platforms (Railway, Render, Fly.io) provide automatic SSL for custom domains.

## Production Checklist

- [ ] Environment variables configured securely
- [ ] Strong SESSION_SECRET (32+ characters)
- [ ] PostgreSQL database set up with backups
- [ ] Google OAuth redirect URIs updated for production domain
- [ ] SSL/HTTPS enabled
- [ ] CORS origins updated in production (server/src/index.ts)
- [ ] Database backups configured
- [ ] Monitoring/logging set up
- [ ] Health check endpoint accessible (/health)
- [ ] Update GOOGLE_REDIRECT_URI in .env

## CORS Configuration for Production

Update `server/src/index.ts` for your production domain:

```typescript
app.use('*', cors({
    origin: process.env.NODE_ENV === 'production'
        ? 'https://yourdomain.com'  // Update this
        : 'http://localhost:3000',
    credentials: true,
}));
```

Or allow multiple origins:

```typescript
const allowedOrigins = [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
    'http://localhost:3000', // for local testing
];

app.use('*', cors({
    origin: (origin) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return origin;
        }
        return false;
    },
    credentials: true,
}));
```

## Monitoring and Maintenance

### Health Check

The application provides a health check endpoint:

```bash
curl https://yourdomain.com/health
# Response: {"status":"ok","timestamp":"2024-..."}
```

### Logs

```bash
# Docker logs
docker-compose logs -f app

# Railway
railway logs

# Render
Check Render dashboard

# Fly.io
flyctl logs
```

### Database Backups

**Docker:**
```bash
docker-compose exec postgres pg_dump -U merlin merlin > backup_$(date +%Y%m%d).sql
```

**Managed Databases:**
Most managed database services (Railway, Supabase, etc.) provide automatic backups.

## Troubleshooting

### Application won't start

1. Check logs for errors
2. Verify all environment variables are set
3. Ensure database is accessible
4. Check if migrations ran successfully

### OAuth errors

1. Verify Google OAuth credentials
2. Check redirect URI matches exactly (including http/https)
3. Ensure Google+ API is enabled
4. Check OAuth consent screen is configured

### Database connection errors

1. Verify DATABASE_URL is correct
2. Check database is running and accessible
3. Verify database credentials
4. Check firewall rules (if applicable)

## Support

For issues and questions:
- Check existing documentation
- Review application logs
- Open an issue on GitHub
