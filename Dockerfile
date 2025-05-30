# Stage 1: Base - Imagen base con Node y directorio de trabajo
FROM node:22.15.0 AS base
WORKDIR /usr/src/app

# Stage 2: Dependencias - Instala TODAS las dependencias necesarias
FROM base AS deps
COPY package.json yarn.lock ./
# --frozen-lockfile asegura que se usa yarn.lock
# --prefer-offline puede acelerar builds si las dependencias están cacheadas localmente por Yarn
RUN yarn install --frozen-lockfile --prefer-offline

# Stage 3: Builder - Copia el código fuente y construye la aplicación
FROM deps AS builder
COPY . .
RUN yarn build

# Stage 4: Production - Imagen final optimizada y más ligera
FROM node:22.15.0-slim AS production
ENV NODE_ENV=production
WORKDIR /usr/src/app

# Copia los archivos de definición de dependencias
COPY --chown=node:node --from=deps /usr/src/app/package.json /usr/src/app/yarn.lock ./

# Copia el directorio 'build' compilado desde el builder (Remix usa 'build' no 'dist')
COPY --chown=node:node --from=builder /usr/src/app/build ./build

# Copia archivos públicos necesarios
COPY --chown=node:node --from=builder /usr/src/app/public ./public

# Instalar solo dependencias de producción (Remix necesita remix-serve)
RUN yarn install --production --frozen-lockfile --ignore-scripts --prefer-offline

# Cambiar propiedad de archivos al usuario node
RUN chown -R node:node /usr/src/app

# Cambia al usuario no-root 'node'
USER node

EXPOSE 3000

# Comando por defecto para iniciar la aplicación con remix-serve
CMD ["yarn", "start"]

# --- Stage para Desarrollo ---
FROM deps AS development
COPY . .
EXPOSE 5173
# El CMD para desarrollo se sobreescribirá en docker-compose.yml