# ============================================================
# server/Dockerfile — build context: ./server (self-contained)
# ============================================================
# Build standalone:  cd server && docker build -t rfnews-server .
# Build via compose: docker compose build server
#
# Runtime config comes from the environment ONLY (root .env -> env_file in
# docker-compose.yml). No .env is ever baked into the image.
# ============================================================

# Stage 1: Builder — install deps & compile TypeScript
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (for Docker layer caching)
COPY package*.json ./
RUN npm ci

# Copy build config
COPY tsconfig.json ./

# Copy source code
COPY src ./src

# Compile TypeScript to JavaScript
RUN npm run build

# ============================================================
# Stage 2: Production — minimal Node.js runtime
# ============================================================
FROM node:20-alpine

WORKDIR /app

# Install production dependencies only (no devDependencies)
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# Expose backend API port (internal only — never published on the VPS)
EXPOSE 5001

# Run as root so the SQLite database can be created/updated in the /data volume
# which may be owned by the host root user
CMD ["node", "--no-warnings", "dist/index.js"]
