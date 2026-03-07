FROM node:20-alpine

WORKDIR /app

# Install server dependencies first for build cache efficiency.
COPY server/package*.json ./
COPY server/prisma ./prisma
COPY server/prisma.config.ts ./prisma.config.ts
RUN npm ci
RUN npx prisma generate

# Copy runtime source.
COPY server/src ./src

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

# Run migrations on each deploy/start, then boot Fastify.
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
