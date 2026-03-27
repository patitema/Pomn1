FROM python:3.11-slim

WORKDIR /app

# Установка системных зависимостей для mysqlclient
RUN apt-get update && apt-get install -y \
    default-libmysqlclient-dev \
    gcc \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Установка зависимостей Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копирование кода приложения
COPY . .

# Открываем порт для Django
EXPOSE 8000

# Запуск Django
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
