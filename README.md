# POMNI

POMNI is a web application for personal notes, nested folders, knowledge links, and task planning. It combines a file view, an interactive knowledge graph, Markdown notes, calendar and Kanban task workflows, transactional email, password recovery, and opt-in browser push reminders.

The frontend is a React 19 SPA built with Vite and Feature-Sliced Design. The backend is Django 5.2 with Django REST Framework. Docker Compose runs MySQL, Redis, the Django API, Celery worker and beat services, and the frontend nginx container.

## Quick Start

Start the complete local stack:

```bash
docker compose up -d --build
```

Then open:

- Frontend and proxied API: `http://localhost:3000`
- Backend API through the frontend nginx proxy: `http://localhost:3000/api/`

The default Docker stack does not publish the backend service to the host. If direct `localhost:8000` backend access is needed for local API debugging, opt in explicitly:

```bash
docker compose -f docker-compose.yml -f docker-compose.local.yml up -d --build
```

Then direct local backend access is available at `http://localhost:8000/api/`.

For split local development:

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

```bash
cd frontend
npm ci
npm start
```

When the frontend does not use the Docker nginx proxy, set `REACT_APP_API_URL=http://localhost:8000/api` or `VITE_API_URL=http://localhost:8000/api`.

## Current Features

- Registration, login, logout, token-based session restore, protected routes, and password recovery by email.
- Welcome email after registration and security notification after a password change.
- Notes and folders stored in one `Note` model, with folders represented by `is_folder=True`.
- Nested file/folder view with note expansion, search, filters, editing, deletion, and drag-and-drop moving.
- D3 knowledge graph with note/folder nodes, reader panel, toolbar actions, and user-created graph links.
- Markdown editing and rendering through shared editor and viewer components.
- Task week, calendar, all-tasks, and Kanban board views.
- Task status, priority, optional schedule, all-day mode, optional deadline, checklist, filters, completion, restore, removal, and week drag-and-drop.
- User-created Kanban columns, board-only tasks, importing regular tasks, moving tasks between columns, collapsed columns, and explicit column deletion behavior.
- Linked task previews and actions for regular notes; folders do not own tasks.
- Opt-in Web Push reminders: a daily task summary and one reminder for an approaching deadline.
- Profile settings for phone number, timezone, and push notifications.
- Responsive desktop, tablet, and phone layouts.

## Tech Stack

### Frontend

- React 19.1
- Vite 8 and Vitest 4
- React Router DOM 7.6
- Redux Toolkit 2.11 and RTK Query
- D3.js 7.9
- dnd-kit 6.3
- Material UI 9
- `@uiw/react-md-editor` and `react-markdown`

### Backend and Runtime

- Python 3.11 in Docker
- Django 5.2.7
- Django REST Framework 3.16.1
- DRF TokenAuthentication
- MySQL 8 via `mysqlclient`
- Celery 5.6 with Redis 7.4
- `pywebpush` 2.3
- `django-cors-headers`
- flake8

## Development Commands

### Docker

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f
docker compose down
```

Rebuild only the affected existing service during normal development:

```bash
docker compose build frontend
docker compose up -d --no-deps frontend
```

```bash
docker compose build backend
docker compose up -d --no-deps backend
```

### Frontend

```bash
cd frontend
npm ci
npm start
npm run build
npm run start:prod
npm test
npx eslint src/ --max-warnings=0
```

### Backend

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
python manage.py check
python manage.py makemigrations --check --dry-run
python manage.py test api
flake8 api/ backend/ --max-line-length=120 --exclude=migrations,__pycache__
```

### API Collection

```bash
newman run tests/api/postman-collection.json --env-var baseUrl=http://localhost:8000/api --bail
```

## Environment

Frontend:

```env
# Docker and production: frontend nginx proxies /api to Django.
REACT_APP_API_URL=/api

# Split local development:
REACT_APP_API_URL=http://localhost:8000/api
VITE_API_URL=http://localhost:8000/api
```

Representative Docker/backend variables:

```env
COMPOSE_PROJECT_NAME=pomni
FRONTEND_PORT=3000
# BACKEND_PORT is used only with docker-compose.local.yml for explicit local direct backend access.
BACKEND_PORT=8000

DB_ROOT_PASSWORD=change-me
DB_NAME=Pomni
DB_USER=pomni
DB_PASSWORD=change-me

DJANGO_DEBUG=False
DJANGO_SECRET_KEY=change-me
ALLOWED_HOSTS=localhost,127.0.0.1,pomn1.ru,148.253.208.46
CORS_ALLOWED_ORIGINS=https://pomn1.ru

EMAIL_ENABLED=False
EMAIL_HOST=mail.pomn1.ru
EMAIL_PORT=587
EMAIL_HOST_USER=no-reply@pomn1.ru
EMAIL_HOST_PASSWORD=change-me
EMAIL_USE_TLS=True
EMAIL_USE_SSL=False
DEFAULT_FROM_EMAIL=POMNI <no-reply@pomn1.ru>
EMAIL_MESSAGE_ID_DOMAIN=pomn1.ru

PUBLIC_APP_URL=http://localhost:3000
PASSWORD_RESET_TIMEOUT=3600
PASSWORD_RESET_IP_RATE=10/15m
PASSWORD_RESET_EMAIL_RATE=3/15m
PASSWORD_RESET_TRUSTED_PROXY_COUNT=2
CACHE_TABLE=pomni_cache

WEB_PUSH_ENABLED=False
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:support@pomni.ru
WEB_PUSH_TIMEOUT=10
CELERY_BROKER_URL=redis://redis:6379/0
```

Defaults keep email and Web Push disabled until their credentials are configured. Production uses `PUBLIC_APP_URL=https://pomn1.ru`. Keep all real passwords, Django secrets, SMTP credentials, and VAPID private keys only in the server `.env`; never commit them.

Production must not publish the backend service directly to the internet. Route public traffic through the frontend nginx container and keep `/api` proxied internally to `backend:8000`. In production `.env`, set:

```env
PUBLIC_APP_URL=https://pomn1.ru
DJANGO_DEBUG=False
DJANGO_SECURE_SSL_REDIRECT=True
DJANGO_SECURE_PROXY_SSL_HEADER=True
DJANGO_SESSION_COOKIE_SECURE=True
DJANGO_CSRF_COOKIE_SECURE=True
DJANGO_SECURE_HSTS_SECONDS=31536000
DJANGO_SECURE_HSTS_INCLUDE_SUBDOMAINS=True
CORS_ALLOWED_ORIGINS=https://pomn1.ru
```

## Main Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Static home page |
| `/auth` | Public | Login |
| `/registration` | Public | Registration |
| `/password-reset` | Public | Password recovery request |
| `/password-reset/:uid/:token` | Public | New password confirmation |
| `/privacy` | Public | Privacy policy |
| `/terms` | Public | Terms of use |
| `/notes-online`, `/tasks-and-notes`, `/weekly-planner`, `/knowledge-graph`, `/markdown-notes`, `/faq` | Public | SEO and product information |
| `/notes` | Private | Graph view |
| `/folders` | Private | File/folder view |
| `/tasks` | Private | Week, calendar, all-tasks, and board views |
| `/profile` | Private | User and notification settings |

Task links can open a specific week and task:

```text
/tasks?view=week&date=YYYY-MM-DD&task=<task-id>
```

## API Overview

Protected endpoints require:

```http
Authorization: Token <token>
```

Public endpoints:

- `POST /api/register/`
- `POST /api/login/`
- `POST /api/password-reset/request/`
- `POST /api/password-reset/confirm/`

Protected endpoint groups:

- Auth/profile: `POST /api/logout/`, `GET /api/current-user/`, `PUT /api/update-profile/`
- Notes: `GET|POST /api/notes/`, `GET|PUT|DELETE /api/notes/<id>/`
- Folders: `GET|POST /api/folders/`, `GET|PUT|DELETE /api/folders/<id>/`
- Links: `GET|POST /api/links/`, `GET|DELETE /api/links/<id>/`
- Tasks: `GET|POST /api/tasks/`, `GET|PATCH|PUT|DELETE /api/tasks/<id>/`
- Board: `POST /api/tasks/<id>/move-to-board-column/`, `GET|POST /api/task-board/columns/`, `PATCH|DELETE /api/task-board/columns/<id>/`
- Push: `GET|PUT /api/push/settings/`, `POST /api/push/subscriptions/`, `POST /api/push/unsubscribe/`

## Project Structure

```text
Pomn1/
  backend/
    api/
      models.py
      serializer.py
      views.py
      push_views.py
      push_service.py
      tasks.py
      urls.py
      migrations/
    backend/
      celery.py
      settings.py
      urls.py
    manage.py
    requirements.txt
  frontend/
    public/
    src/
      app/
      assets/
      entities/
      features/
      pages/
      shared/
      widgets/
    index.html
    package.json
    vite.config.js
  plans/
  tests/
  AGENTS.md
  ARCHITECTURE.md
  PLANS.md
  README.md
  docker-compose.yml
```

Frontend dependency direction:

```text
app -> pages -> widgets -> features -> entities -> shared
```

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed component, API, persistence, email, and notification flows.

### Route Page Models

Route pages use colocated `model/` modules when they need orchestration beyond simple composition. The current refactor keeps visual components unchanged while moving handlers, derived state, navigation decisions, and deterministic route data into page models or pure helpers. This keeps the FSD direction intact and avoids adding MobX or ReactUse without a concrete repeated need.

Current page-model coverage includes profile, folders, notes, tasks, SEO routes, and the home CTA state. Thin auth, registration, password-reset, and legal wrappers are covered by render tests instead of unnecessary abstractions.

## Contributor Orientation

- Read `AGENTS.md` before changing code.
- Use `PLANS.md` and a living ExecPlan for significant features or refactors.
- Review all files directly under `plans/` before creating a new plan; completed plans live in `plans/complited/`.
- Use `plans/project-init-2026-06-25.md` as the current onboarding snapshot.
- Keep `backend/backend/settings.py`, `docker-compose.yml`, and documented environment names synchronized.
- Plans are local working files and must not be committed unless the product owner explicitly changes that rule.

## Validation Baseline

Frontend:

```bash
cd frontend
npx eslint src/ --max-warnings=0
npm run build
npm test
```

Backend:

```bash
cd backend
python manage.py check
python manage.py makemigrations --check --dry-run
python manage.py migrate
python manage.py test api
```

Use the smallest relevant checks first. User-visible changes also require manual desktop, tablet, and phone verification before the implementation plan is closed.

## Product and Legal

POMNI is maintained as an independent product by ИП Авхимович А. П. Public legal pages are available at `/privacy` and `/terms`.

This repository does not publish an open-source license. Contact `support@pomni.ru` for product or legal questions.
