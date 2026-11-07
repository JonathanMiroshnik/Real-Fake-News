# ============================================================
# client/Dockerfile — build context: ./client (self-contained)
# ============================================================
# Build standalone:  cd client && docker build -t rfnews-client .
# Build via compose: docker compose build client
#
# ⚠️ VITE_* values below are baked into the bundle at BUILD time. They are
#    public (readable in the JS bundle) and changing one needs a rebuild.
# ============================================================

# Stage 1: Builder — compile the Vite/React SPA
FROM node:20-alpine AS builder

WORKDIR /app

# Build arguments (defaults = "nginx proxies /api to server:5001")
ARG VITE_USE_RELATIVE_API=true
ARG VITE_BACKEND_DEV_MODE=false
ARG VITE_API_BASE_DEV=http://localhost:5001
ARG VITE_API_BASE_PROD=http://server:5001
ARG VITE_DEBUG_LOGS=false
ARG VITE_SHOW_HOROSCOPES=true
ARG VITE_SHOW_RECIPES=true
ARG VITE_ARTICLES_CACHE_EXPIRATION_MS=600000

# Promote to ENV so `vite build` picks them up
ENV VITE_USE_RELATIVE_API=$VITE_USE_RELATIVE_API
ENV VITE_BACKEND_DEV_MODE=$VITE_BACKEND_DEV_MODE
ENV VITE_API_BASE_DEV=$VITE_API_BASE_DEV
ENV VITE_API_BASE_PROD=$VITE_API_BASE_PROD
ENV VITE_DEBUG_LOGS=$VITE_DEBUG_LOGS
ENV VITE_SHOW_HOROSCOPES=$VITE_SHOW_HOROSCOPES
ENV VITE_SHOW_RECIPES=$VITE_SHOW_RECIPES
ENV VITE_ARTICLES_CACHE_EXPIRATION_MS=$VITE_ARTICLES_CACHE_EXPIRATION_MS

# Copy package files first (for Docker layer caching)
COPY package*.json ./
RUN npm ci

# Copy build config files
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY postcss.config.js ./
COPY tailwind.config.js ./
COPY eslint.config.js ./

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
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port (upstream reverse proxy handles TLS)
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
