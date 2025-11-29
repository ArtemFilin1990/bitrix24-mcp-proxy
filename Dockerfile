# Base image
FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# Install all dependencies (dev + prod)
FROM base AS deps
ENV NODE_ENV=development
COPY package*.json ./
RUN npm ci --ignore-scripts

# Development stage (hot reload via compose)
FROM deps AS development
COPY tsconfig*.json ./
COPY src ./src
COPY openapi.json ./openapi.json
COPY vercel.json ./vercel.json
CMD ["npm", "run", "dev"]

# Build application
FROM deps AS builder
COPY tsconfig*.json ./
COPY src ./src
RUN npm run build

# Install only production dependencies
FROM base AS prod-deps
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# Final runtime image
FROM base AS runner
USER node
COPY --chown=node:node package*.json ./
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
EXPOSE 3000
CMD ["node", "build/index.js"]
