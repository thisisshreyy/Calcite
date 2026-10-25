# ==========================================
# Stage 1: Build React Frontend
# ==========================================
FROM node:22-alpine AS frontend-builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
ENV BASE_PATH=/
RUN npm run build

# ==========================================
# Stage 2: Build Express + TypeScript Backend
# ==========================================
FROM node:22-alpine AS backend-builder
WORKDIR /app/server

COPY server/package*.json ./
RUN npm ci

COPY server/ ./
RUN npm run build

# ==========================================
# Stage 3: Minimal Production Image
# ==========================================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/data

COPY server/package*.json ./
RUN npm ci --omit=dev

COPY --from=backend-builder /app/server/dist ./dist-server
COPY --from=frontend-builder /app/dist ./dist

RUN mkdir -p /data

EXPOSE 3000

VOLUME ["/data"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

CMD ["node", "dist-server/index.js"]
