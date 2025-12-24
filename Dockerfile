# Multi-stage build for Merlin application

# Stage 1: Build the server
FROM node:20-alpine AS server-builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies for the entire workspace
RUN npm ci

# Copy server source code and prisma schema
COPY server ./server

# Generate Prisma Client
WORKDIR /app/server
RUN npx prisma generate

# Build server
RUN npm run build

# Stage 2: Build the client
FROM node:20-alpine AS client-builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm ci

# Copy client source code
COPY client ./client

# Build client
WORKDIR /app/client
RUN npm run build

# Stage 3: Production image
FROM node:20-alpine AS production

WORKDIR /app

# Install production dependencies
COPY package*.json ./
COPY server/package*.json ./server/

# Install only production dependencies
RUN npm ci --omit=dev --workspace=server

# Copy built server from builder
COPY --from=server-builder /app/server/dist ./server/dist
COPY --from=server-builder /app/server/prisma ./server/prisma
COPY --from=server-builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=server-builder /app/server/node_modules/.prisma ./server/node_modules/.prisma

# Copy built client from builder
COPY --from=client-builder /app/client/dist ./client/dist

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Set working directory to server
WORKDIR /app/server

# Run database migrations and start server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
