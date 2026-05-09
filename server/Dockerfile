# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (for better layer caching)
COPY server/package*.json ./
RUN npm ci

# Copy TypeScript config
COPY server/tsconfig.json ./

# Copy all source files - try copying the entire src directory
# Build context is root (.), so server/src maps to ./src in container
COPY server/src ./src

# Build TypeScript
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Install production dependencies only
COPY server/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built code from builder
COPY --from=builder /app/dist ./dist

# Create non-root user matching typical host UID/GID (1000:1000)
# Files written to mounted volumes (./database:/data) will be owned by this user
# Change these if your host user has a different UID/GID
ARG UID=1000
ARG GID=1000
RUN addgroup -g $GID appgroup && \
    adduser -D -u $UID -G appgroup appuser && \
    chown -R appuser:appgroup /app

# Expose port
EXPOSE 5001

# Switch to non-root user
USER appuser

# Start server
CMD ["node", "--no-warnings", "dist/index.js"]

