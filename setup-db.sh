#!/bin/bash

# Database Configuration Helper
# This script helps you set up the correct DATABASE_URL for your local PostgreSQL

echo "🔍 Detecting PostgreSQL configuration..."
echo ""

# Get current user
CURRENT_USER=$(whoami)
echo "✓ Current user: $CURRENT_USER"

# Check if merlin database exists
if psql -lqt | cut -d \| -f 1 | grep -qw merlin; then
    echo "✓ Database 'merlin' exists"
else
    echo "⚠ Database 'merlin' does not exist"
    echo "  Creating database..."
    createdb merlin
    if [ $? -eq 0 ]; then
        echo "✓ Database 'merlin' created successfully"
    else
        echo "✗ Failed to create database"
        exit 1
    fi
fi

echo ""
echo "📝 Your DATABASE_URL should be:"
echo ""
echo "DATABASE_URL=postgresql://$CURRENT_USER@localhost:5432/merlin"
echo ""
echo "Copy this line to your .env file!"
echo ""
echo "Then run: npm run db:push"
