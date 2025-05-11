################
#  Etapa build #
################
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build          # genera /app/dist

##################
#  Etapa runtime #
##################
FROM nginx:1.27-alpine

# Copiamos artefactos estáticos
COPY --from=builder /app/dist /usr/share/nginx/html

# Config único de Nginx (ya con puerto 8080)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
# mantenemos el entrypoint por defecto => nginx -g "daemon off;"
