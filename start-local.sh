#!/bin/bash

# Start-local.sh - Local development environment launcher for Redis Chat App
# This script sets up and starts all the local services needed for development

echo "🚀 Starting local development environment for Redis Chat App"

# Function to show help message
show_help() {
  echo "Usage: $0 [options]"
  echo ""
  echo "Options:"
  echo "  --init-data    Initialize Redis with test data"
  echo "  --reset        Reset all data (drops Redis volumes)"
  echo "  --help         Show this help message"
  echo ""
  exit 0
}

# Parse command line arguments
INIT_DATA=false
RESET=false

for arg in "$@"; do
  case $arg in
    --init-data)
      INIT_DATA=true
      ;;
    --reset)
      RESET=true
      ;;
    --help)
      show_help
      ;;
  esac
done

# Check if .env.local exists, if not create it from example
if [ ! -f .env.local ]; then
  echo "Creating .env.local file from example..."
  cp .env.local.example .env.local
  echo "✅ Created .env.local with local development settings"
fi

# Make sure uploads directory exists
mkdir -p public/uploads
echo "✅ Ensured uploads directory exists"

# Start Redis container using docker-compose
if [ "$RESET" = true ]; then
  echo "🔄 Resetting Redis data..."
  docker-compose down -v
  echo "✅ Redis data reset"
fi

echo "🔄 Starting Redis and Redis Commander with Docker..."
docker-compose up -d
echo "✅ Redis services started"

# Wait for Redis to be available
echo "⏳ Waiting for Redis to be ready..."
sleep 3

# Initialize test data if requested
if [ "$INIT_DATA" = true ]; then
  echo "🔄 Initializing test data..."
  node scripts/init-test-data.js
  echo "✅ Test data initialized"
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
  echo "✅ Dependencies installed"
fi

# Start the Next.js development server
echo "🌐 Starting Next.js development server..."
echo "🔗 Access the app at http://localhost:3000"
echo "🔗 Access Redis Commander at http://localhost:8081"
echo "🔑 Use the local auth page at http://localhost:3000/local-auth to log in"
echo ""
echo "💡 Additional commands:"
echo "  ./start-local.sh --init-data    # Initialize with test data"
echo "  ./start-local.sh --reset        # Reset all data"
echo "  ./start-local.sh --help         # Show help"
echo ""
echo "💡 Press Ctrl+C to stop the development server"

npm run dev
