# Pomni — Система управления знаниями и задачами

[![Status](https://img.shields.io/badge/status-in%20development-yellow)]()
[![Frontend](https://img.shields.io/badge/frontend-React%2019-blue)]()
[![Backend](https://img.shields.io/badge/backend-Django%205-green)]()
[![Architecture](https://img.shields.io/badge/architecture-FSD-purple)]()

**Pomni** — это веб-приложение для хранения, структурирования и визуализации персональных знаний. Объединяет управление заметками с интерактивным графом связей, помогая создать ваш «второй мозг».

---

## Оглавление

- [О проекте](#-о-проекте)
- [Возможности](#-возможности)
- [Технологический стек](#-технологический-стек)
- [Архитектура](#-архитектура)
- [Установка](#-установка)
- [Использование](#-использование)
- [API](#-api)
- [Структура проекта](#-структура-проекта)
- [Статус разработки](#-статус-разработки)
- [Лицензия](#-лицензия)

---

## О проекте

Pomni решает проблему информационной перегрузки, объединяя:
- **Заметки** с иерархической организацией по папкам
- **Визуализацию связей** между идеями через граф знаний
- **Управление задачами** с отслеживанием статусов
- **Личный кабинет** для управления профилем

Проект разрабатывается в рамках выпускной квалификационной работы студентом группы 1ИСП-21 Авхимовичем Артёмом.

---

## Макет проекта
[Figma](https://www.figma.com/design/NzO9621BwOjAhEfXcHInfy/POMNI?node-id=0-1&t=2uIEHR6eoZz5QBKO-1)

### Реализовано
- Главная страница
- Страница управления заметками в виде файловой системы
- Страница управления заметками графа
- Страница личного кабинета

### В разработке
- Страница управления задачами
- Страница отслеживания задач

## Возможности

### Реализовано ✅
- Создание, редактирование и удаление заметок
- Организация заметок по папкам с поддержкой вложенности
- Регистрация и аутентификация пользователей
- Личный кабинет с управлением профилем
- Визуализация графа знаний (D3.js)
- Drag-and-drop для перемещения заметок между папками
- Поиск по заметкам и папкам

### В разработке 🚧
- Markdown-редактор для заметок
- Теги для заметок
- Полноценный таск-трекинг со статусами
- Дедлайны для задач
- Экспорт данных (JSON, PDF)
- Автоматическое построение связей между заметками

---

## Технологический стек

### Backend
| Технология | Версия | Назначение |
|------------|--------|------------|
| **Django** | 5.2.7 | Веб-фреймворк |
| **Django REST Framework** | 3.16.1 | API |
| **MySQL** | — | База данных |
| **mysqlclient** | 2.2.7 | Драйвер БД |
| **django-cors-headers** | 4.9.0 | CORS |

### Frontend
| Технология | Версия | Назначение |
|------------|--------|------------|
| **React** | 19.1.0 | UI-фреймворк |
| **Redux Toolkit** | 2.11.2 | Управление состоянием |
| **RTK Query** | 2.11.2 | API и кэширование |
| **React Router DOM** | 7.6.0 | Роутинг |
| **D3.js** | 7.9.0 | Визуализация графа |
| **@dnd-kit/core** | 6.3.1 | Drag-and-drop |

---

## Архитектура

Frontend приложение использует архитектуру **Feature-Sliced Design (FSD)** для масштабируемости и поддерживаемости кода.

### Слои FSD

```
src/
├── app/                    # Инициализация приложения (провайдеры, роутинг)
├── pages/                  # Страницы приложения
├── widgets/                # Композиционные блоки (Header, Footer, NoteGraph)
├── features/               # Бизнес-сценарии (CRUD, аутентификация)
├── entities/               # Бизнес-сущности (Note, Folder, User)
└── shared/                 # Переиспользуемый код (UI, API, утилиты)
```

### Правила зависимостей

```
app → pages → widgets → features → entities → shared
```

**Запрещено:**
- Зависимости снизу вверх
- Зависимости между модулями одного слоя
- Пропуск слоёв

### Управление состоянием

- **Redux Toolkit** — глобальное состояние
- **RTK Query** — API запросы и кэширование
- **Селекторы** — мемоизированный доступ к данным

[Подробнее об архитектуре](docs/ARCHITECTURE.md)

---

## Установка

### Требования
- Python 3.10+
- Node.js 18+
- MySQL 8.0+
- **Docker и Docker Compose** (для контейнеризации)

---

## 🚀 Быстрый старт

### Запуск через Docker (рекомендуется)

```bash
# Клонирование репозитория
git clone <repository-url>
cd Pomn1

# Запуск всех сервисов
docker-compose up --build
```

После запуска:
- **Frontend:** http://localhost:80  ⚠️ **Порт изменён с 3000 на 80!**
- **Backend API:** http://localhost:8000/api/
- **База данных:** localhost:3306

Для остановки:
```bash
docker-compose down
```

**Важно:** Frontend теперь работает на **80 порту** (nginx), а не на 3000!

---

## Локальная разработка (без Docker)

### 1. Настройка Backend
```bash
cd backend

# Создание виртуального окружения
python -m venv .venv

# Активация виртуального окружения
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# Установка зависимостей
pip install -r requirements.txt

# Настройка базы данных
# Отредактируйте backend/backend/settings.py
# Укажите параметры подключения к MySQL

# Применение миграций
python manage.py migrate

# Запуск сервера разработки
python manage.py runserver 0.0.0.0:8000
```

### 2. Настройка Frontend
```bash
cd frontend

# Установка зависимостей
npm install

# Запуск сервера разработки
npm start
```

Frontend будет доступен на http://localhost:3000

**Важно:** Для локальной разработки создайте `.env` файл:
```env
REACT_APP_API_URL=http://localhost:8000/api
```

### 4. Настройка базы данных
Создайте базу данных `Pomni` в MySQL:
```sql
CREATE DATABASE Pomni CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## Production деплой

### Docker Compose

```bash
# Сборка и запуск
docker-compose up -d --build

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down
```

### Архитектура развёртывания

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│  Твой nginx     │────▶│   Django     │────▶│    MySQL    │
│  (Custom Loc)   │     │  (port 8000) │     │ (port 3306) │
└─────────────────┘     └──────────────┘     └─────────────┘
        │
        └─ /api/* → backend:8000
        └─ /* → frontend:3000
```

### Настройка внешнего nginx

Если используешь панель (aaPanel, CyberPanel, etc.), настрой проксирование:

**Location для frontend:**
```
Location: /
Proxy URL: http://localhost:3000/
```

**Location для API:**
```
Location: /api/
Proxy URL: http://localhost:8000/api/
```

### Режимы работы

#### Разработка (локально)
```bash
cd frontend
npm install
npm start  # Dev-сервер на http://localhost:3000
```

#### Production (Docker)
```bash
docker-compose up -d --build
# Frontend на http://localhost:3000 (production build)
```

#### Production (без Docker)
```bash
cd frontend
npm install
npm run build
npm run start:prod  # Serve на http://localhost:3000
```

### Переменные окружения

#### Frontend (.env)
```env
REACT_APP_API_URL=/api
```

#### Backend (.env или settings.py)
```python
DB_HOST=db
DB_NAME=Pomni
DB_USER=pomni
DB_PASSWORD=pomnipassword
```

---

## 🚀 Использование

После запуска:
- **Frontend:** http://localhost:80
- **Backend API:** http://localhost:8000/api/

### Основные маршруты
| Страница | URL | Описание |
|----------|-----|----------|
| Главная | `/` | Лендинг проекта |
| Заметки (граф) | `/Notes` | Визуализация графа знаний |
| Папки | `/Folder` | Управление заметками и папками |
| Задачи | `/Tasks` | Трекер задач (в разработке) |
| Профиль | `/Profile` | Личный кабинет |
| Вход | `/Auth` | Аутентификация |
| Регистрация | `/Reg` | Регистрация пользователя |

---

## API

### Аутентификация

#### Регистрация
```http
POST /api/register/
Content-Type: application/json

{
  "username": "user",
  "email": "user@example.com",
  "password": "password123",
  "phone_number": "+79991234567"
}
```

#### Вход
```http
POST /api/login/
Content-Type: application/json

{
  "username": "user",
  "password": "password123"
}
```

**Ответ:**
```json
{
  "token": "abc123...",
  "user": {
    "id": 1,
    "username": "user",
    "email": "user@example.com",
    "phone_number": "+79991234567"
  }
}
```

### Заметки

#### Получить все заметки
```http
GET /api/notes/
Authorization: Token <your-token>
```

#### Создать заметку
```http
POST /api/notes/
Authorization: Token <your-token>
Content-Type: application/json

{
  "title": "Моя заметка",
  "text": "Текст заметки",
  "folder_id": 1
}
```

#### Обновить заметку
```http
PUT /api/notes/<id>/
Authorization: Token <your-token>
Content-Type: application/json

{
  "title": "Обновлённый заголовок"
}
```

#### Удалить заметку
```http
DELETE /api/notes/<id>/
Authorization: Token <your-token>
```

### Папки

#### Получить все папки
```http
GET /api/folders/
Authorization: Token <your-token>
```

#### Создать папку
```http
POST /api/folders/
Authorization: Token <your-token>
Content-Type: application/json

{
  "title": "Новая папка",
  "parent": null
}
```

---

## Структура проекта

```
Pomn1/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── api/
│   │   ├── models.py        # Модели данных
│   │   ├── views.py         # API endpoints
│   │   ├── urls.py          # Маршруты
│   │   ├── serializer.py    # Сериализаторы
│   │   └── ...
│   └── backend/
│       ├── settings.py      # Настройки Django
│       ├── urls.py
│       └── ...
├── frontend/
│   ├── package.json
│   ├── public/
│   └── src/
│       ├── app/                 # Инициализация (провайдеры, роутинг)
│       │   ├── providers/
│       │   │   ├── ReduxProvider/
│       │   │   └── Router/
│       │   └── styles/
│       ├── pages/               # Страницы (7 страниц)
│       │   ├── home/
│       │   ├── auth/
│       │   ├── registration/
│       │   ├── notes/
│       │   ├── folders/
│       │   ├── profile/
│       │   └── tasks/
│       ├── widgets/             # Виджеты (Header, Footer, NoteGraph)
│       ├── features/            # Фичи (CRUD, auth, drag-and-drop)
│       ├── entities/            # Сущности (Note, Folder, User)
│       └── shared/              # Общее (UI, API, config)
├── docs/
│   ├── THEORY_REPORT.md
│   ├── IMPLEMENTATION.md
│   └── ARCHITECTURE.md          # Документация по FSD
├── reports/                     # Отчёты по миграции
├── plans/                       # Планы миграции
└── README.md
```

---

## Статус разработки

| Модуль | Статус | Прогресс |
|--------|--------|----------|
| Аутентификация | ✅ Готово | 100% |
| Управление заметками | ✅ Готово | 100% |
| Управление папками | ✅ Готово | 100% |
| Граф знаний | ✅ Готово | 95% |
| Таск-трекинг | ⚠️ В разработке | 10% |
| Markdown-редактор | ❌ Не начато | 0% |
| Экспорт данных | ❌ Не начато | 0% |

**Общий прогресс:** ~75%

### Миграция на FSD + Redux

✅ **Завершено:**
- Настройка Redux Toolkit + RTK Query
- Рефакторинг на Feature-Sliced Design
- CRUD операции для заметок и папок
- Визуализация графа на D3.js
- Аутентификация и авторизация
- Глобальные стили и UI компоненты

[История миграции](reports/)

---

## Лицензия

Проект разрабатывается в учебных целях в рамках выпускной квалификационной работы.

---

## Контакты

**Студент:** Авхимович Артём Петрович  
**Группа:** 1ИСП-21  
**Научный руководитель:** Воробьёв Константин Владимирович  
**Университет:** Алтайский государственный технический университет им. И.И. Ползунова

---

## 📚 Документация

- [Теоретические требования](docs/THEORY_REPORT.md)
- [Отчёт о реализации](docs/IMPLEMENTATION.md)
