# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Accept build arguments for Vite environment variables
ARG VITE_BACKEND_DEV_MODE=true
ARG VITE_API_BASE_DEV=http://localhost:5001
ARG VITE_API_BASE_PROD=http://server:5001
ARG VITE_USE_RELATIVE_API=false
ARG VITE_DEBUG_LOGS=true

# Set as environment variables for Vite build
ENV VITE_BACKEND_DEV_MODE=$VITE_BACKEND_DEV_MODE
ENV VITE_API_BASE_DEV=$VITE_API_BASE_DEV
ENV VITE_API_BASE_PROD=$VITE_API_BASE_PROD
ENV VITE_USE_RELATIVE_API=$VITE_USE_RELATIVE_API
ENV VITE_DEBUG_LOGS=$VITE_DEBUG_LOGS

# Copy package files
COPY client/package*.json ./
RUN npm ci

# Copy source code and config
COPY client/src ./src
COPY client/public ./public
COPY client/index.html ./
COPY client/vite.config.ts ./
COPY client/tsconfig.json ./
COPY client/tsconfig.*.json ./
COPY client/eslint.config.js ./

# Build React app (environment variables are baked into the bundle)
RUN npm run build

# Stage 2: Production - Serve with Nginx
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

