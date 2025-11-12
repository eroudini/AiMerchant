# apps/bff/Dockerfile - builds and runs the server BFF
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN npm --prefix server ci && npm --prefix server run build

FROM node:20-alpine
WORKDIR /app/server
ENV NODE_ENV=production
COPY --from=build /app/server/dist ./dist
COPY --from=build /app/server/package.json ./package.json
COPY --from=build /app/server/node_modules ./node_modules
EXPOSE 4000
CMD ["node", "dist/index.js"]
