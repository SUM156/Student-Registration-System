# syntax=docker/dockerfile:1
FROM node:18-alpine

ENV NODE_ENV=production
WORKDIR /app

# Install dependencies first (separate layer) so code-only changes
# don't invalidate the dependency-install cache layer on every rebuild.
COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Run as a non-root user — Alpine images run as root by default, which
# is unnecessary privilege for a process that only needs to bind one
# port and talk to MySQL.
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "src/server.js"]
