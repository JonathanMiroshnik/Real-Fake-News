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

# Debug: Check what was actually copied
RUN echo "=== Current directory ===" && \
    pwd && \
    echo "=== Contents of /app ===" && \
    ls -la && \
    echo "=== Contents of src (if exists) ===" && \
    ls -la src/ 2>&1 || echo "src/ does not exist" && \
    echo "=== Looking for database files ===" && \
    find . -name "*.ts" -type f | head -20 && \
    echo "=== Checking src/lib/database specifically ===" && \
    ls -la src/lib/database/ 2>&1 || echo "src/lib/database/ does not exist" && \
    echo "=== Checking if files exist ===" && \
    test -f src/lib/database/database.ts && echo "database.ts EXISTS" || echo "database.ts MISSING" && \
    test -d src/lib/database && echo "database directory EXISTS" || echo "database directory MISSING"

# Verify critical files exist
RUN test -f src/lib/database/database.ts || (echo "ERROR: database.ts not found!" && find . -name "database.ts" && exit 1) && \
    test -f src/lib/database/schema.ts || (echo "ERROR: schema.ts not found!" && exit 1) && \
    test -f src/lib/database/sqliteOperations.ts || (echo "ERROR: sqliteOperations.ts not found!" && exit 1) && \
    echo "✓ All database files found"

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

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5001/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Start server
CMD ["node", "--no-warnings", "dist/index.js"]

