# Pomni

Pomni is a web application for managing notes, folders, knowledge links, and tasks. The frontend is a React 19 SPA built with Vite, the backend is Django 5.2 + Django REST Framework, and MySQL is used in Docker/prod-style environments.

The frontend follows Feature-Sliced Design: `app -> pages -> widgets -> features -> entities -> shared`.

## Current Features

- User registration, login, logout, session restore, and protected private routes.
- Notes and folders stored in one unified `Note` model with `is_folder`.
- Folder/file view with nested folders, note expansion, full-text note search, filters, editing modals, deletion, and drag-and-drop note moving.
- Graph view for notes and folders with D3.js, node selection, reader panel, edit/delete toolbar actions, and link creation flow.
- Markdown editing and rendering for notes through shared `MarkdownEditor` and `MarkdownViewer`.
- Tasks page with week, calendar, and all-tasks views.
- Task CRUD through backend API and RTK Query.
- Task status, priority, scheduled date/time, optional deadline, checklists, filters, completion/restore/remove actions, and week drag-and-drop.
- Linked task previews and linked task actions for regular notes; folders do not own tasks.
- Profile page with phone input mask and backend validation.
- Production security settings controlled by environment variables.

## Tech Stack

### Frontend

- React 19.1
- Vite 8
- Vitest 4
- React Router DOM 7.6
- Redux Toolkit 2.11 + RTK Query
- D3.js 7.9
- dnd-kit 6.3
- Material UI 9
- `@uiw/react-md-editor`
- `react-markdown`

### Backend

- Python 3.10+
- Django 5.2.7
- Django REST Framework 3.16.1
- DRF TokenAuthentication
- MySQL via `mysqlclient`
- `django-cors-headers`
- flake8

## Development Commands

### Docker

```bash
docker compose up -d --build
docker compose logs -f
docker compose down
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

Frontend dev server: `http://localhost:3000`.

### Backend

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
python manage.py check
flake8 api/ backend/ --max-line-length=120 --exclude=migrations,__pycache__
```

Backend API: `http://localhost:8000/api/`.

### API Tests

```bash
newman run tests/api/postman-collection.json --env-var baseUrl=http://localhost:8000/api --bail
```

## Environment

Frontend:

```env
REACT_APP_API_URL=/api
REACT_APP_API_URL=http://localhost:8000/api
VITE_API_URL=http://localhost:8000/api
```

Docker/backend:

```env
COMPOSE_PROJECT_NAME=pomni_main
FRONTEND_PORT=3000
BACKEND_PORT=8000

DB_ROOT_PASSWORD=change-me
DB_NAME=Pomni
DB_USER=pomni
DB_PASSWORD=change-me

DJANGO_DEBUG=False
DJANGO_SECRET_KEY=change-me
ALLOWED_HOSTS=localhost,127.0.0.1,patitema-site.ru,api.patitema-site.ru,148.253.208.46
CORS_ALLOWED_ORIGINS=https://patitema-site.ru
DJANGO_SECURE_SSL_REDIRECT=False
DJANGO_SECURE_PROXY_SSL_HEADER=False
DJANGO_SESSION_COOKIE_SECURE=False
DJANGO_CSRF_COOKIE_SECURE=False
DJANGO_SECURE_HSTS_SECONDS=0
```

Use real secret values on the server. Do not commit `.env` files with production secrets.

## Main Routes

| Route | Purpose |
| --- | --- |
| `/` | Home page |
| `/auth` | Login |
| `/registration` | Registration |
| `/notes` | Graph view for notes/folders |
| `/folders` | File/folder view |
| `/tasks` | Task tracker |
| `/profile` | User profile |

Private routes: `/notes`, `/folders`, `/tasks`, `/profile`.

`/tasks` also supports task-week navigation:

```text
/tasks?view=week&date=YYYY-MM-DD&task=<task-id>
```

## API Overview

All endpoints except login/register require:

```http
Authorization: Token <token>
```

Core endpoints:

- `POST /api/register/`
- `POST /api/login/`
- `POST /api/logout/`
- `GET /api/current-user/`
- `PUT /api/update-profile/`
- `GET|POST /api/notes/`
- `GET|PUT|DELETE /api/notes/<id>/`
- `GET|POST /api/folders/`
- `GET|PUT|DELETE /api/folders/<id>/`
- `GET|POST /api/links/`
- `GET|DELETE /api/links/<id>/`
- `GET|POST /api/tasks/`
- `GET|PATCH|PUT|DELETE /api/tasks/<id>/`

## Project Structure

```text
Pomn1/
  backend/
    manage.py
    requirements.txt
    api/
      models.py
      serializer.py
      views.py
      urls.py
      validators.py
      migrations/
    backend/
      settings.py
      urls.py
  frontend/
    index.html
    package.json
    vite.config.js
    nginx.conf
    public/
    src/
      app/
      assets/
      pages/
      widgets/
      features/
      entities/
        user/
        note/
        folder/
        link/
        task/
      shared/
        api/
        config/
        lib/
        ui/
  tests/
  plans/
  README.md
  ARCHITECTURE.md
```

## Architecture Notes

- `shared/api` owns RTK Query endpoints and the 401 interceptor.
- Auth state lives in `entities/user`.
- Domain helpers live in `entities/*/model`.
- Reusable UI lives in `shared/ui`.
- Page-level orchestration remains in `pages`, with larger visual blocks in `widgets`.
- Frontend aliases are configured through `frontend/vite.config.js` and editor config.
- Legacy CRA/CRACO setup has been removed.
- Legacy top-level frontend folders (`components`, `context`, `hooks`, `utils`) have been removed from `frontend/src`.

See [ARCHITECTURE.md](ARCHITECTURE.md) for the detailed architecture guide.

## Current Status

| Area | Status |
| --- | --- |
| Authentication/session | Working |
| Notes/folders CRUD | Working |
| Markdown editor/viewer | Working |
| Graph view and manual graph links | Working |
| Folder full-text search and filters | Implemented |
| Tasks API and UI | Implemented |
| Optional task deadlines | Implemented |
| Task checklists and linked task actions | Implemented |
| Linked task previews in notes | Implemented |
| Vite migration | Completed |
| Production security env wiring | Completed |
| Compact UI scale redesign | In progress |
| Export | Not started |
| Tags | Not started |

## Validation Baseline

Common frontend validation:

```bash
cd frontend
npx eslint src/ --max-warnings=0
npm run build
npm test
```

Common backend validation:

```bash
cd backend
python manage.py check
python manage.py migrate
```

Run backend validation after model or migration changes.

## License

The project is developed for educational purposes as part of a graduation qualification work.
