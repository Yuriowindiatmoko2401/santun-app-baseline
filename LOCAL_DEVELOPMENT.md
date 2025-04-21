# Local Development Guide for Redis Chat App

This guide explains how to run the entire Redis Chat App locally without requiring any external services like Upstash Redis, Kinde Auth, Pusher, or Cloudinary.

## Prerequisites

- Node.js 18+ installed
- Docker and Docker Compose installed
- Git (to clone the repository)

## Quick Start

We've created a convenient script to start the local development environment:

```bash
# Make the script executable (if not already)
chmod +x start-local.sh

# Run the local development environment
./start-local.sh
```

This script will:
1. Create a `.env.local` file if it doesn't exist
2. Ensure the uploads directory exists
3. Start Redis and Redis Commander using Docker
4. Install dependencies if needed
5. Start the Next.js development server

## Manual Setup

If you prefer to set things up manually:

1. **Copy the environment template**:
   ```bash
   cp .env.local.example .env.local
   ```

2. **Start Docker services**:
   ```bash
   docker-compose up -d
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

## Local Alternatives

### 1. Redis
- Uses Docker to run a local Redis server
- Redis Commander is included for visual database inspection at http://localhost:8081
- Implementation: `src/lib/db-local.ts`

### 2. Authentication (Kinde Auth)
- Simple JWT-based local authentication
- Login page at `/local-auth`
- Implementation: `src/lib/auth-local.ts`

### 3. Real-time Messaging (Pusher)
- Socket.io implementation that mimics Pusher's API
- Automatically connects with same channel/event structure
- Implementation: `src/lib/socketio-local.ts`

### 4. File Storage (Cloudinary)
- Local file storage in `/public/uploads/`
- Simplifies image uploads for development
- Implementation: `src/lib/uploads-local.ts`

## Available Local Services

Once everything is running, you can access:

- **Application**: http://localhost:3000
- **Redis Commander**: http://localhost:8081
- **Local Authentication**: http://localhost:3000/local-auth

## Switching Between Local and Production

The system uses the environment variable `USE_LOCAL_SERVICES=true` to determine whether to use local services or external ones. This is set in the `.env.local` file.

## Troubleshooting

1. **Redis Connection Issues**:
   - Ensure Docker is running
   - Check if Redis container is up with `docker ps`
   - Redis should be accessible at `localhost:6379`

2. **Authentication Problems**:
   - The local auth system uses a token stored in cookies
   - Clear cookies if you encounter issues

3. **File Upload Issues**:
   - Ensure the `/public/uploads` directory exists and is writable
   - Check browser console for any errors during upload

4. **Real-time Issues**:
   - Refresh the page to reconnect Socket.io
   - Check browser console for connection messages

## How It Works

The application conditionally loads different implementations based on the `USE_LOCAL_SERVICES` environment variable:

```typescript
// Example from src/lib/db.ts
const isLocalDev = process.env.USE_LOCAL_SERVICES === 'true';
export const redis = isLocalDev ? localRedis : new Redis({...});
```

This pattern is applied across the app for all external dependencies, making local development seamless.

## Resetting Data

Since we're using a local Redis instance with Docker, you can easily reset all data:

```bash
# Stop containers
docker-compose down

# Remove volumes
docker-compose down -v

# Start again
docker-compose up -d
```
