# ==============================================================================
# PayShield Frontend & Sentinel Gateway - Production Dockerfile for EC2
# ==============================================================================
FROM node:20-alpine

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci --legacy-peer-deps || npm install

# Copy source files
COPY . .

# Build Vite client production bundle into dist/
RUN npm run build

# Production runtime configuration
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start PayShield Sentinel Gateway
CMD ["npx", "tsx", "server.ts"]
