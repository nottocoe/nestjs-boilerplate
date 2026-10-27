# ---------- deps ----------
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY src/infrastructure/prisma ./src/infrastructure/prisma
RUN npm ci --prefer-offline --no-audit

# ---------- builder ----------
FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/src/infrastructure/prisma ./src/infrastructure/prisma
COPY . .

RUN npm run prisma:generate
RUN npm run build
RUN npm prune --omit=dev

# ---------- runner ----------
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PATH="/app/node_modules/.bin:${PATH}"

RUN apk upgrade --no-cache \
    && apk add --no-cache ca-certificates openssl \
    && addgroup -g 1001 -S appgroup \
    && adduser -u 1001 -S appuser -G appgroup \
    && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx \
    && printf '#!/bin/sh\ncmd="$1"; shift\nexec "/app/node_modules/.bin/$cmd" "$@"\n' > /usr/local/bin/npx \
    && chmod +x /usr/local/bin/npx

COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/src/infrastructure/prisma ./src/infrastructure/prisma
COPY --from=builder --chown=appuser:appgroup /app/package.json ./package.json

USER appuser
EXPOSE 3000
CMD ["/bin/sh", "-c", ". /vault/secrets/config && node dist/index.js"]
