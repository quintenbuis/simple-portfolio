# syntax=docker/dockerfile:1

# 1. Bouwen en testen: de image bouwt alleen als build én tests slagen.
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run check

# 2. Serveren: alleen de statische site, via nginx zonder root-rechten.
FROM nginxinc/nginx-unprivileged:1.30-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s CMD wget -q --spider http://127.0.0.1:8080/ || exit 1
