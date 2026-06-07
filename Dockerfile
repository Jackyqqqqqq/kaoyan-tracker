FROM node:20-slim AS base
WORKDIR /app

FROM base AS deps
COPY package.json ./
RUN npm install

FROM deps AS build
COPY . .
RUN npm run build

FROM node:20-slim AS production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
COPY db ./db
COPY drizzle.config.ts ./
COPY app_db_export.json ./
COPY seed.mjs ./

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/boot.js"]
