# Base image
FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# Install production dependencies only
FROM base AS deps
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# Install dev dependencies for building
FROM base AS build-deps
ENV NODE_ENV=development
COPY package*.json ./
RUN npm ci --ignore-scripts

# Build application
FROM build-deps AS builder
COPY tsconfig*.json ./
COPY openapi.json ./openapi.json
COPY scripts ./scripts
COPY src ./src
RUN npm run build

# Development stage (hot reload via compose)
FROM build-deps AS development
COPY tsconfig*.json ./
COPY openapi.json ./openapi.json
COPY scripts ./scripts
COPY src ./src
CMD ["npm", "run", "dev"]

# Final runtime image
FROM base AS runner
USER node
COPY --chown=node:node package*.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget -q --spider http://localhost:3000/mcp/health || exit 1
CMD ["node", "dist/index.js"]
