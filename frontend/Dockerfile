FROM node:18-alpine AS builder

WORKDIR /app

# Копируем только package файлы сначала
COPY package.json package-lock.json ./

# Установка всех зависимостей (включая dev для craco)
RUN npm ci && npm cache clean --force

# Теперь копируем весь исходный код
COPY . .

# Сборка production-версии
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Копируем только build и package.json для serve
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./

# Устанавливаем serve для раздачи статики
RUN npm install --global serve

EXPOSE 3000

# Запуск serve для раздачи build
CMD ["serve", "-s", "build", "-l", "3000"]
