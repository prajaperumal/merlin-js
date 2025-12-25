#!/bin/bash
# Merlin Production Deployment Script for systemd
#
# This script will:
# 1. Pull latest code (if git repo)
# 2. Install dependencies
# 3. Build client and server
# 4. Generate Prisma client and sync database schema
# 5. Create/update systemd service
# 6. Start the application
#
# Run this on your production server as your application user (not root)

set -e

echo "🎬 Merlin Production Deployment"
echo "==============================="
echo ""

# Check if running as the correct user
if [ "$USER" = "root" ]; then
    echo "❌ Do not run this script as root!"
    echo "Run as your application user (e.g., ubuntu)"
    exit 1
fi

# Configuration
APP_DIR="/home/$USER/merlin-js"
SERVICE_FILE="/etc/systemd/system/merlin.service"
ENV_FILE="/etc/merlin.env"
START_SCRIPT="$APP_DIR/start-production.sh"

echo "📍 Application directory: $APP_DIR"
echo ""

# Navigate to app directory
cd "$APP_DIR"

# Pull latest code (if git repo)
if [ -d ".git" ]; then
    echo "📥 Pulling latest code..."
    git pull
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo ""

# Build application
echo "🔨 Building application..."
npm run build
echo ""

# Create start script if it doesn't exist
if [ ! -f "$START_SCRIPT" ]; then
    echo "📝 Creating production start script..."
    cat > "$START_SCRIPT" << 'EOF'
#!/bin/bash
set -e

cd /home/$USER/merlin-js

# Build both client and server
echo "Building application..."
npm run build

# Setup database
cd server
echo "Setting up database..."
echo "Generating Prisma client..."
npx prisma generate

# Push schema to database (creates/updates all tables)
echo "Pushing database schema to sync with code..."
if npx prisma db push --accept-data-loss --skip-generate; then
    echo "✓ Database schema updated successfully"
else
    echo "⚠ db push failed, trying migrate deploy..."
    if npx prisma migrate deploy; then
        echo "✓ Migrations applied successfully"
    else
        echo "❌ ERROR: Database setup failed!"
        echo "Tables may not exist or be outdated."
        echo "Please run manually: cd server && npx prisma db push"
        # Don't exit, let the service try to start anyway
    fi
fi

# Start server (which serves the built client)
echo "Starting server..."
cd /home/$USER/merlin-js
exec npm start --workspace=server
EOF

    # Replace $USER placeholder
    sed -i "s/\$USER/$USER/g" "$START_SCRIPT"
    chmod +x "$START_SCRIPT"
    echo "✓ Start script created"
    echo ""
fi

# Create/update systemd service file
echo "📝 Creating/updating systemd service file..."
echo "This requires sudo access..."

sudo tee "$SERVICE_FILE" > /dev/null << EOF
[Unit]
Description=Merlin Movie Discovery App
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$APP_DIR
ExecStart=$START_SCRIPT
Restart=always
RestartSec=10

Environment=NODE_ENV=production
EnvironmentFile=$ENV_FILE

StandardOutput=journal
StandardError=journal
SyslogIdentifier=merlin

NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

echo "✓ Service file updated"
echo ""

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "⚠️  Environment file not found!"
    echo "Creating template at $ENV_FILE..."
    echo "You need to edit this file with your credentials!"
    echo ""

    sudo tee "$ENV_FILE" > /dev/null << 'EOF'
# Merlin Environment Configuration

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/merlin

# TMDB API
TMDB_API_KEY=your_tmdb_api_key_here

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/auth/callback

# Session Secret (generate with: openssl rand -base64 32)
SESSION_SECRET=your_random_session_secret_here

# Server
PORT=8000
NODE_ENV=production
EOF

    sudo chmod 600 "$ENV_FILE"

    echo "❌ Please edit $ENV_FILE with your credentials:"
    echo "   sudo nano $ENV_FILE"
    echo ""
    echo "Then run this script again to complete deployment."
    exit 0
fi

# Reload systemd
echo "🔄 Reloading systemd daemon..."
sudo systemctl daemon-reload

# Enable service
echo "✅ Enabling merlin service..."
sudo systemctl enable merlin

# Restart service
echo "🔄 Restarting merlin service..."
sudo systemctl restart merlin

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Service status:"
sudo systemctl status merlin --no-pager || true

echo ""
echo "📝 Useful commands:"
echo "  sudo systemctl status merlin    - Check service status"
echo "  sudo systemctl restart merlin   - Restart service"
echo "  sudo systemctl stop merlin      - Stop service"
echo "  sudo journalctl -u merlin -f    - View logs"
echo ""
echo "🌐 Your app should be running on port 8000"
echo "   Make sure Caddy is configured to proxy to localhost:8000"
