# QWEN.md — Контекст проекта Pomni

## Обзор проекта

**Pomni** — веб-приложение для хранения, структурирования и визуализации персональных знаний. Объединяет управление заметками с интерактивным графом связей, помогая создать «второй мозг».

Проект разрабатывается в рамках выпускной квалификационной работы студентом группы 1ИСП-21 Авхимовичем Артёмом Петровичем (Алтайский государственный технический университет им. И.И. Ползунова).

**Макет:** [Figma](https://www.figma.com/design/NzO9621BwOjAhEfXcHInfy/POMNI?node-id=0-1&t=2uIEHR6eoZz5QBKO-1)

---

## Технологический стек

### Backend
| Технология | Версия | Назначение |
|------------|--------|------------|
| Django | 5.2.7 | Веб-фреймворк |
| Django REST Framework | 3.16.1 | API |
| MySQL | 8.0 | База данных |
| mysqlclient | 2.2.7 | Драйвер БД |
| django-cors-headers | 4.9.0 | CORS |

### Frontend
| Технология | Версия | Назначение |
|------------|--------|------------|
| React | 19.1.0 | UI-фреймворк |
| Redux Toolkit | 2.11.2 | Управление состоянием |
| RTK Query | 2.11.2 | API и кэширование |
| React Router DOM | 7.6.0 | Роутинг |
| D3.js | 7.9.0 | Визуализация графа |
| @dnd-kit/core | 6.3.1 | Drag-and-drop |
| CRACO | 7.1.0 | Кастомизация CRA |

---

## Архитектура

### Frontend: Feature-Sliced Design (FSD)

```
app → pages → widgets → features → entities → shared
```

Зависимости идут **только сверху вниз**. Запрещено: зависимости снизу вверх, между модулями одного слоя, пропуск слоёв.

| Слой | Назначение |
|------|------------|
| `app/` | Инициализация, провайдеры, роутинг |
| `pages/` | Страницы (Auth, home, registration, Notes, folders, Profile, Tasks) |
| `widgets/` | Крупные блоки (header, footer, navigation, note-graph) |
| `features/` | Бизнес-сценарии (auth, CRUD, drag-and-drop) |
| `entities/` | Бизнес-сущности (Note, Folder, User) |
| `shared/` | Переиспользуемый код (api, config, ui) |

### Backend: Django REST Framework

- **Аутентификация:** TokenAuthentication (стандартная DRF)
- **Модели:** Folder, Note, Link, Profile
- **Endpoints:** `/api/register/`, `/api/login/`, `/api/logout/`, `/api/current-user/`, `/api/update-profile/`, `/api/notes/`, `/api/folders/`

### Управление состоянием

- **Redux Toolkit** — глобальное состояние (auth slice: token, user, isAuthenticated, loading, error)
- **RTK Query** — API запросы и кэширование (tag types: Note, Folder, User)
- **401 Interceptor** — `baseQueryWithReauth` перехватывает 401, dispatch `logout()` + редирект на `/auth`

### Контроль сессии

- **ProtectedRoute** (`shared/ui`) — guard для приватных маршрутов через `<Outlet />`
- **UserInit** (`app/providers`) — восстановление сессии из localStorage при старте
- **Токен:** `localStorage.getItem('token')`, заголовок `Authorization: Token <token>`

---

## Команды

### Docker (рекомендуемый способ)

```bash
# Сборка и запуск всех сервисов
docker-compose up -d --build

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down
```

### Backend (локальная разработка)

```bash
cd backend
# Установка зависимостей
pip install -r requirements.txt

# Миграции
python manage.py migrate

# Запуск сервера
python manage.py runserver
```

### Frontend (локальная разработка)

```bash
cd frontend
# Установка зависимостей
npm install

# Запуск dev-сервера
npm start

# Сборка
npm run build

# Production запуск
npm run start:prod
```

### Переменные окружения

**Frontend** (`.env`):
```env
REACT_APP_API_URL=http://localhost:8000/api  # Local dev
# REACT_APP_API_URL=/api                    # Production (nginx proxy)
```

**Backend** (env docker-compose):
```env
DB_HOST=db
DB_NAME=Pomni
DB_USER=pomni
DB_PASSWORD=pomnipassword
```

---

## Сервисы и порты

| Сервис | URL | Описание |
|--------|-----|----------|
| Frontend | http://localhost:3000 | React приложение |
| Backend API | http://localhost:8000/api/ | Django REST API |
| MySQL | localhost:3306 | База данных |

### Маршруты

| Страница | URL | Auth |
|----------|-----|------|
| Главная | `/` | Нет |
| Вход | `/auth` | Нет |
| Регистрация | `/registration` | Нет |
| Заметки (граф) | `/notes` | Да |
| Папки | `/folders` | Да |
| Задачи | `/tasks` | Да |
| Профиль | `/profile` | Да |

---

## Статус разработки

| Модуль | Статус | Прогресс |
|--------|--------|----------|
| Аутентификация | ✅ Готово | 100% |
| Управление заметками | ✅ Готово | 100% |
| Управление папками | ✅ Готово | 100% |
| Граф знаний | ⚠️ В разработке | 20% |
| Таск-трекинг | ⚠️ В разработке | 10% |
| Markdown-редактор | ❌ Не начато | 0% |
| Экспорт данных | ❌ Не начато | 0% |

---

## Соглашения по коду

### Frontend

- **Prettier:** `trailingComma: "es5"`, `tabWidth: 2`, `semi: false`, `singleQuote: true`
- **ESLint:** `extends: ["react-app", "react-app/jest"]`
- **FSL:** строго следовать слоям app → pages → widgets → features → entities → shared
- **Импорты:** только вниз по слоям, без пропусков и горизонтальных зависимостей

### Backend

- Python 3.10+, Django 5.2
- MySQL с `utf8mb4` кодировкой
- Строгий режим SQL: `STRICT_TRANS_TABLES`
- CORS разрешён только для конкретных origins

---

## Инфраструктура

### Docker Compose

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  frontend   │────▶│   backend    │────▶│    MySQL    │
│  (port 3000)│     │  (port 8000) │     │ (port 3306) │
└─────────────┘     └──────────────┘     └─────────────┘
```

- `frontend` — Node.js 18, CRACO build, serve в production
- `backend` — Python 3.11, Django + mysqlclient
- `db` — MySQL 8.0 с healthcheck

### CI/CD

Настроен GitLab CI с stages: build → test → deploy (конфигурация заглушка в `.gitlab-ci.yml`).

---

## Контакты

- **Студент:** Авхимович Артём Петрович
- **Группа:** 1ИСП-21
- **Научный руководитель:** Воробьёв Константин Владимирович
- **Университет:** Алтайский государственный технический университет им. И.И. Ползунова
