# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Accept build arguments for Vite environment variables
ARG VITE_BACKEND_DEV_MODE=true
ARG VITE_API_BASE_DEV=http://localhost:5001
ARG VITE_API_BASE_PROD=http://server:5001
ARG VITE_USE_RELATIVE_API=false
ARG VITE_FRONTEND_DEV_MODE=true
ARG VITE_CLIENT_URL_DEV=http://localhost:5173
ARG VITE_CLIENT_URL_PROD=http://localhost:5173

# Set as environment variables for Vite build
ENV VITE_BACKEND_DEV_MODE=$VITE_BACKEND_DEV_MODE
ENV VITE_API_BASE_DEV=$VITE_API_BASE_DEV
ENV VITE_API_BASE_PROD=$VITE_API_BASE_PROD
ENV VITE_USE_RELATIVE_API=$VITE_USE_RELATIVE_API
ENV VITE_FRONTEND_DEV_MODE=$VITE_FRONTEND_DEV_MODE
ENV VITE_CLIENT_URL_DEV=$VITE_CLIENT_URL_DEV
ENV VITE_CLIENT_URL_PROD=$VITE_CLIENT_URL_PROD

# Copy package files
COPY admin/package*.json ./
RUN npm ci

# Copy source code and config
COPY admin/src ./src
COPY admin/svelte.config.js ./
COPY admin/vite.config.ts ./
COPY admin/tsconfig.json ./

# Build SvelteKit app (environment variables are baked into the bundle)
RUN npm run build

# Stage 2: Production - Serve with Nginx
FROM nginx:alpine

# Copy built files from builder (SvelteKit outputs to build/)
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY admin/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

