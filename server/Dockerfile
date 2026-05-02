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

# Create data directory for images (will be mounted as volume)
RUN mkdir -p /app/data/images /app/data/images/compressed

# Expose port
EXPOSE 5001

# Start server
CMD ["node", "--no-warnings", "dist/index.js"]

