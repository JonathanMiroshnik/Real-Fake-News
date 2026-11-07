# ============================================================
# admin/Dockerfile — build context: ./admin (self-contained)
# ============================================================
# Build standalone:  cd admin && docker build -t rfnews-admin .
# Build via compose: docker compose build admin
#
# ⚠️ VITE_* values below are baked into the bundle at BUILD time (public values).
# ============================================================

# Stage 1: Builder — compile the Vite/React SPA
FROM node:20-alpine AS builder

WORKDIR /app

# Build arguments (defaults = "nginx proxies /api to server:5001")
ARG VITE_USE_RELATIVE_API=true
ARG VITE_BACKEND_DEV_MODE=false
ARG VITE_API_BASE_DEV=http://localhost:5001
ARG VITE_API_BASE_PROD=http://server:5001
ARG VITE_FRONTEND_DEV_MODE=false
ARG VITE_CLIENT_URL_DEV=http://localhost:5173
ARG VITE_CLIENT_URL_PROD=https://real.sensorcensor.xyz

# Promote to ENV so `vite build` picks them up
ENV VITE_USE_RELATIVE_API=$VITE_USE_RELATIVE_API
ENV VITE_BACKEND_DEV_MODE=$VITE_BACKEND_DEV_MODE
ENV VITE_API_BASE_DEV=$VITE_API_BASE_DEV
ENV VITE_API_BASE_PROD=$VITE_API_BASE_PROD
ENV VITE_FRONTEND_DEV_MODE=$VITE_FRONTEND_DEV_MODE
ENV VITE_CLIENT_URL_DEV=$VITE_CLIENT_URL_DEV
ENV VITE_CLIENT_URL_PROD=$VITE_CLIENT_URL_PROD

# Copy package files first (for Docker layer caching)
COPY package*.json ./
RUN npm ci

# Copy build config files
COPY tsconfig*.json ./
COPY vite.config.ts ./

# Copy entry HTML
COPY index.html ./

# Copy source code and public assets
COPY src ./src
COPY public ./public

# Build React app (environment variables are baked into the bundle)
RUN npm run build

# ============================================================
# Stage 2: Production — serve static files with Nginx
# ============================================================
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port (upstream reverse proxy handles TLS)
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
