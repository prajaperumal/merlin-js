# Merlin Production Setup Guide

Quick reference for deploying Merlin to production with systemd and Caddy.

## Prerequisites

- Ubuntu/Debian server
- PostgreSQL installed and running
- Caddy installed
- Node.js 18+ installed
- Your server's domain pointed to the server IP

## Quick Setup

### 0. Quick Fix for Common Issues

**Getting "table does not exist" errors?** Run this one-liner:

```bash
cd /home/ubuntu/merlin-js && ./setup-database.sh && sudo systemctl restart merlin
```

### 1. Initial Server Setup

```bash
# Clone your repository
cd /home/ubuntu
git clone <your-repo-url> merlin-js
cd merlin-js

# Install dependencies
npm install

# Build the application
npm run build
```

### 2. Setup Environment Variables

```bash
# Create environment file
sudo nano /etc/merlin.env
```

Add your configuration:
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/merlin

# TMDB API
TMDB_API_KEY=your_tmdb_api_key_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/auth/callback

# Session Secret (generate with: openssl rand -base64 32)
SESSION_SECRET=your_random_32_char_secret_here

# Server
PORT=8000
NODE_ENV=production
```

```bash
# Secure the file
sudo chmod 600 /etc/merlin.env
```

### 3. Setup Database

```bash
cd /home/ubuntu/merlin-js/server

# Generate Prisma Client
npx prisma generate

# Push schema to database (for existing database)
npx prisma db push

# OR run migrations (if you have migration files)
npx prisma migrate deploy

# Optional: Seed the database
npx prisma db seed
```

### 4. Deploy with systemd

```bash
cd /home/ubuntu/merlin-js

# Run the automated deployment script
./deploy-systemd.sh
```

This script will:
- Create the production startup script
- Create the systemd service file
- Enable and start the service
- Show you the service status

### 5. Configure Caddy

Create `/etc/caddy/Caddyfile`:

```caddy
yourdomain.com {
    reverse_proxy localhost:8000

    encode gzip

    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        X-Frame-Options "SAMEORIGIN"
        X-Content-Type-Options "nosniff"
    }
}
```

Reload Caddy:
```bash
sudo systemctl reload caddy
```

## Managing the Service

```bash
# Check service status
sudo systemctl status merlin

# Start the service
sudo systemctl start merlin

# Stop the service
sudo systemctl stop merlin

# Restart the service
sudo systemctl restart merlin

# View logs
sudo journalctl -u merlin -f

# View last 100 lines of logs
sudo journalctl -u merlin -n 100

# Check if service is enabled
sudo systemctl is-enabled merlin
```

## Deploying Updates

When you have new code to deploy:

```bash
cd /home/ubuntu/merlin-js

# Pull latest code
git pull

# Install any new dependencies
npm install

# Build the application
npm run build

# Run migrations if needed
cd server
npx prisma migrate deploy
cd ..

# Restart the service
sudo systemctl restart merlin

# Check logs
sudo journalctl -u merlin -f
```

Or use the deployment script:
```bash
./deploy-systemd.sh
```

## Troubleshooting

### Service won't start

1. Check the logs:
```bash
sudo journalctl -u merlin -n 50 --no-pager
```

2. Verify environment variables:
```bash
sudo cat /etc/merlin.env
```

3. Test the build locally:
```bash
cd /home/ubuntu/merlin-js
npm run build
```

4. Check database connection:
```bash
cd /home/ubuntu/merlin-js/server
npx prisma db pull  # This will test the connection
```

### Prisma migration errors

**Error: "The table `public.users` does not exist in the current database" (P2021)**

This means the database schema hasn't been created yet:

```bash
cd /home/ubuntu/merlin-js/server

# Generate Prisma client first
npx prisma generate

# Push schema to create all tables
npx prisma db push

# Restart the service
cd ..
sudo systemctl restart merlin
```

If you get "database is not empty" errors:

```bash
cd /home/ubuntu/merlin-js/server

# Use db push instead (simpler)
npx prisma db push

# OR create initial migration
npx prisma migrate resolve --applied "0_init"
```

### Port already in use

Check what's using port 8000:
```bash
sudo lsof -i :8000
```

Kill the process if needed:
```bash
sudo kill -9 <PID>
```

### CORS errors

Make sure your CORS origin in the code matches your domain. The server already has flexible CORS configured for Caddy reverse proxy.

### OAuth errors

1. Verify Google OAuth redirect URI matches exactly:
   - In Google Cloud Console: `https://yourdomain.com/api/auth/callback`
   - In `/etc/merlin.env`: `GOOGLE_REDIRECT_URI=https://yourdomain.com/api/auth/callback`

2. Make sure Google+ API is enabled in Google Cloud Console

3. Check OAuth consent screen is configured

## File Locations

- **Application**: `/home/ubuntu/merlin-js`
- **Service File**: `/etc/systemd/system/merlin.service`
- **Environment**: `/etc/merlin.env`
- **Start Script**: `/home/ubuntu/merlin-js/start-production.sh`
- **Caddy Config**: `/etc/caddy/Caddyfile`
- **Logs**: `sudo journalctl -u merlin`

## Security Checklist

- [ ] Strong SESSION_SECRET (32+ characters)
- [ ] Environment file has correct permissions (600)
- [ ] PostgreSQL password is strong
- [ ] SSL/HTTPS enabled (Caddy handles this automatically)
- [ ] Google OAuth redirect URI uses HTTPS
- [ ] Database backups configured
- [ ] Firewall rules configured (allow 80, 443, 22 only)

## Monitoring

### Check if app is running
```bash
curl http://localhost:8000/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Check public access
```bash
curl https://yourdomain.com/health
```

### Monitor logs in real-time
```bash
sudo journalctl -u merlin -f
```

### Check Caddy logs
```bash
sudo journalctl -u caddy -f
```

## Database Backup

```bash
# Manual backup
pg_dump -U your_user merlin > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
psql -U your_user merlin < backup_file.sql
```

## Performance Tuning

If you experience high load:

1. **Enable connection pooling** (if using many concurrent users)
2. **Add a CDN** for static assets
3. **Use PM2** instead of systemd for better process management:

```bash
sudo npm install -g pm2
cd /home/ubuntu/merlin-js
pm2 start server/dist/index.js --name merlin
pm2 startup systemd
pm2 save
```

## Getting Help

- Check the logs first: `sudo journalctl -u merlin -f`
- Review this guide
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment options
- Check [DOCKER.md](DOCKER.md) for Docker deployment alternative
