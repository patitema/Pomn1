FROM node:18-alpine AS builder

WORKDIR /app

# Копируем package.json и craco.config.js
COPY package*.json craco.config.js ./

# Установка зависимостей
RUN npm install && npm cache clean --force

# Копируем весь исходный код
COPY . .

# Сборка production-версии
RUN npm run build

# Production-запуск через serve
FROM node:18-alpine

WORKDIR /app

# Копируем build и node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
