#!/bin/bash
# Merlin Docker Startup Script

set -e

echo "🎬 Merlin Docker Setup"
echo "====================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running."
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo "✓ Docker is running"
echo ""

# Check for environment file
if [ ! -f .env.docker.local ]; then
    echo "⚙️  Creating environment configuration..."
    cp .env.docker .env.docker.local
    echo ""
    echo "📝 Please edit .env.docker.local and add your:"
    echo "   - TMDB_API_KEY"
    echo "   - GOOGLE_CLIENT_ID"
    echo "   - GOOGLE_CLIENT_SECRET"
    echo "   - SESSION_SECRET (random 32+ character string)"
    echo ""
    echo "After editing, run this script again."
    exit 0
fi

echo "✓ Environment file found"
echo ""

# Check if containers are already running
if docker-compose ps | grep -q "Up"; then
    echo "🔄 Merlin is already running!"
    echo ""
    echo "Available commands:"
    echo "  ./docker-start.sh stop    - Stop the application"
    echo "  ./docker-start.sh restart - Restart the application"
    echo "  ./docker-start.sh logs    - View application logs"
    echo "  ./docker-start.sh rebuild - Rebuild and restart"
    exit 0
fi

# Handle commands
case "${1:-start}" in
    start)
        echo "🚀 Starting Merlin..."
        echo ""
        docker-compose --env-file .env.docker.local up -d
        echo ""
        echo "✓ Merlin is starting!"
        echo ""
        echo "Please wait 30-40 seconds for the database to initialize..."
        echo ""
        echo "🌐 Application will be available at:"
        echo "   http://localhost:8000"
        echo ""
        echo "📊 View logs:"
        echo "   ./docker-start.sh logs"
        echo ""
        echo "🛑 Stop the application:"
        echo "   ./docker-start.sh stop"
        ;;

    stop)
        echo "🛑 Stopping Merlin..."
        docker-compose down
        echo "✓ Merlin stopped"
        ;;

    restart)
        echo "🔄 Restarting Merlin..."
        docker-compose --env-file .env.docker.local restart
        echo "✓ Merlin restarted"
        ;;

    logs)
        echo "📊 Showing logs (Ctrl+C to exit)..."
        docker-compose logs -f
        ;;

    rebuild)
        echo "🔨 Rebuilding Merlin..."
        docker-compose down
        docker-compose --env-file .env.docker.local up --build -d
        echo "✓ Merlin rebuilt and started"
        ;;

    clean)
        echo "🧹 Cleaning up (this will delete database data)..."
        read -p "Are you sure? (yes/no): " -r
        if [[ $REPLY == "yes" ]]; then
            docker-compose down -v
            echo "✓ Cleanup complete"
        else
            echo "Cancelled"
        fi
        ;;

    *)
        echo "Usage: ./docker-start.sh [command]"
        echo ""
        echo "Commands:"
        echo "  start   - Start Merlin (default)"
        echo "  stop    - Stop Merlin"
        echo "  restart - Restart Merlin"
        echo "  logs    - View logs"
        echo "  rebuild - Rebuild and restart"
        echo "  clean   - Stop and remove all data"
        exit 1
        ;;
esac
