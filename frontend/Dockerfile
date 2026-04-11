FROM node:18-alpine AS builder

WORKDIR /app

# Копируем package файлы
COPY package.json package-lock.json ./

# Установка всех зависимостей
RUN npm ci && npm cache clean --force

# Копируем исходный код
COPY . .

# Сборка через npx craco build (явно указываем craco)
RUN npx craco build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Копируем build
COPY --from=builder /app/build ./build

# Устанавливаем serve
RUN npm install --global serve

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]
