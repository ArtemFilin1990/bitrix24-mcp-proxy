# syntax=docker/dockerfile:1

# =============================================================================
# Production image
# =============================================================================
FROM node:20-alpine AS production

# Security: run as non-root user
RUN addgroup -g 1001 -S nodejs \
    && adduser -S nodejs -u 1001

WORKDIR /app

# Copy package files and install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy pre-built application (build locally before docker build)
COPY dist ./dist

# Copy additional files if needed
COPY api ./api
COPY openapi.json ./
COPY vercel.json ./

# Set ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start application
CMD ["node", "dist/index.js"]
