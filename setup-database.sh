#!/bin/bash
# Quick database setup script for Merlin
# Run this if you get "table does not exist" errors

set -e

echo "🗄️  Merlin Database Setup"
echo "======================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found!"
    echo "Please run this script from the merlin-js directory"
    exit 1
fi

# Navigate to server directory
cd server

echo "📦 Generating Prisma Client..."
npx prisma generate

echo ""
echo "🔨 Pushing database schema (creating tables)..."
npx prisma db push --accept-data-loss

echo ""
echo "✅ Database setup complete!"
echo ""
echo "📊 Verifying tables exist..."
npx prisma db execute --stdin <<EOF
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
EOF

echo ""
echo "🎉 All done! Restart your service now:"
echo "   sudo systemctl restart merlin"
