FROM node:18-alpine

WORKDIR /app

# Копирование package файлов
COPY package*.json ./

# Установка зависимостей
RUN npm install

# Копирование исходного кода
COPY . .

# Открываем порт для React Dev Server
EXPOSE 3000

# Запуск React в режиме разработки
CMD ["npm", "start"]
