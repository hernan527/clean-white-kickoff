# Etapa 1: Construcción (Build)
FROM node:20.9.0-alpine AS builder

WORKDIR /app

# Habilitar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Instalar dependencias primero para cachear la capa
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copiar el resto del código
COPY . .

# Construir la aplicación
# NOTA: Vite por defecto saca todo a la carpeta /dist
RUN pnpm run build

### Etapa 2: Servidor de Producción (Nginx)
FROM nginx:1.25.3-alpine-slim

# Configuración de Nginx para React (Manejo de rutas SPA)
COPY config/default.conf /etc/nginx/conf.d/default.conf

# Limpiar directorio por defecto
RUN rm -rf /usr/share/nginx/html/*

# Copiar los archivos construidos desde la etapa anterior
# En React/Vite, el destino suele ser /app/dist
COPY --from=builder /app/dist /usr/share/nginx/html

# Permisos
RUN chown -R nginx:nginx /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]