# ============================================================
# Stage 1: Builder — Install deps & compile TypeScript
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (for Docker layer caching)
COPY server/package*.json ./
RUN npm ci

# Copy build config
COPY server/tsconfig.json ./

# Copy source code
COPY server/src ./src

# Compile TypeScript to JavaScript
RUN npm run build

# ============================================================
# Stage 2: Production — Minimal Node.js runtime
# ============================================================
FROM node:20-alpine

WORKDIR /app

# Install production dependencies only (no devDependencies)
COPY server/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# Expose backend API port
EXPOSE 5001

# Run as root so the SQLite database can be created/updated in the /data volume
# which may be owned by the host root user
CMD ["node", "--no-warnings", "dist/index.js"]

