# Stage 1: Сборка приложения
FROM node:18-alpine AS builder

WORKDIR /app

# Копирование package файлов
COPY package*.json ./

# Установка зависимостей
RUN npm ci --only=production

# Копирование исходного кода
COPY . .

# Сборка production-версии
RUN npm run build

# Stage 2: Nginx для раздачи статики
FROM nginx:alpine

# Копирование build файлов в nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Копирование nginx конфига
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт
EXPOSE 80

# Запуск nginx
CMD ["nginx", "-g", "daemon off;"]
