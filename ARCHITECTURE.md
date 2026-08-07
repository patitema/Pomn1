# POMNI Architecture

POMNI is a React single-page application backed by a Django REST API. The frontend follows Feature-Sliced Design (FSD). MySQL stores application state, Redis is a transient Celery broker, Celery performs scheduled Web Push work, and nginx serves the production frontend.

## System Overview

```text
Browser
  -> static home or React SPA
  -> RTK Query /api requests
  -> Django REST Framework
  -> MySQL

Celery beat -> Redis -> Celery worker -> Web Push providers
Django -> Mailcow SMTP -> transactional email
```

MySQL is authoritative for users, notes, tasks, push subscriptions, notification events, and delivery attempts. Redis does not hold unique business state and may be recreated.

## Frontend Dependency Direction

```text
app -> pages -> widgets -> features -> entities -> shared
```

Rules:

- `shared` must not import from upper layers.
- `entities` may use `shared`, but not `features`, `widgets`, or `pages`.
- `features` may use `entities` and `shared`.
- `widgets` compose `features`, `entities`, and `shared`.
- `pages` own route-level orchestration.
- Prefer each slice's public `index.js` over deep imports.
- Do not recreate top-level `components`, `context`, `hooks`, or `utils` folders under `frontend/src`.

## Current Frontend Tree

```text
frontend/src/
  app/
  assets/
  entities/
    folder/
    link/
    note/
    task/
    user/
  features/
    auth-by-login/
    auth-by-registration/
    create-note/
    create-task/
    delete-folder/
    delete-note/
    delete-task/
    drag-and-drop-note/
    linked-task-actions/
    manage-push-notifications/
    manage-task/
    password-reset-confirm/
    password-reset-request/
    update-folder/
    update-note/
    update-task/
  pages/
    Auth/
    Notes/
    Profile/
    Tasks/
    folders/
    home/
    legal/
    password-reset/
    registration/
    seo/
  shared/
    api/
    config/
    lib/
    ui/
  widgets/
    folder-browser/
    folder-tree/
    footer/
    header/
    navigation/
    note-graph/
    notes-reader/
    notes-toolbar/
    task-board/
    task-reader/
```

Folder creation intentionally uses `features/create-note` with the `isFolder` mode because notes and folders share one backend model.

## Layer Responsibilities

### `app`

Owns the Redux provider, router, global startup, session initialization, and global styles.

### `pages`

Own route-level state and composition:

- `NotesPage` composes the graph, reader, toolbar, and note/folder modals.
- `FoldersPage` composes folder browsing, note expansion, and drag-and-drop movement.
- `TasksPage` owns view selection, filters, task modal orchestration, task navigation, and board mutations.
- Auth, registration, password reset, legal, and SEO pages compose focused lower-layer features.

### `widgets`

Render larger reusable blocks such as navigation, footer, graph, readers, folder browser, and task board. Widgets may compose features, entities, and shared UI but should not own route definitions.

### `features`

Implement user scenarios: authentication, password reset, note/task CRUD, linked task actions, push settings, and drag-and-drop behavior. Feature slices should remain scenario-focused rather than becoming page containers.

### `entities`

Contain domain helpers, selectors, small reusable UI, and URL/date helpers for users, notes, folders, links, and tasks.

### `shared`

Contains infrastructure and generic UI:

- `shared/api`: RTK Query API and auth-aware base query.
- `shared/config`: routes and shared configuration.
- `shared/lib`: generic date and data helpers.
- `shared/ui`: Markdown editor/viewer, phone input, modal primitives, and other reusable controls.

## Routing and Session Flow

Public React routes include login, registration, password reset, legal pages, and SEO pages. Private routes are `/notes`, `/folders`, `/tasks`, and `/profile`. The home route `/` is optimized as a static page and does not mount the full React shell.

Session initialization:

1. `UserInit` reads the DRF token from local storage.
2. If a token exists, it calls `GET /api/current-user/`.
3. A successful response restores the Redux user state.
4. A missing or invalid token clears local authentication.
5. `ProtectedRoute` guards private pages.
6. `baseQueryWithReauth` handles later 401 responses by clearing auth and redirecting to `/auth`.

## Route Page Models

Route pages should stay thin. When a page owns non-trivial orchestration, move that logic into a colocated `model/` module under the page slice. Current examples include:

- `pages/Profile/model/useProfilePageModel.js`: profile form state, submit flow, logout, and push setting orchestration.
- `pages/folders/model/useFoldersPageModel.js`: folder/file state, expansion, filters, modal state, and drag-and-drop handlers.
- `pages/Notes/model/useNotesPageModel.js`: graph selection, node actions, modal state, and connection flow.
- `pages/Tasks/model/useTasksPageModel.js`: task views, filters, task modal state, mutations, board operations, and query navigation.
- `pages/seo/model/seoPageModel.js` and `pages/home/model/homePageModel.js`: pure route data helpers for CTA, SEO metadata, related pages, and fallback behavior.

Views and widgets should receive prepared props and callbacks instead of embedding route orchestration. Keep pure helpers in `model/*.js`, React orchestration in `model/use*PageModel.js`, and focused tests next to those modules. Do not add MobX or another state manager for page cleanup unless repeated state-sharing pressure appears across independent routes.

## State and API

- Redux Toolkit owns global authentication state.
- RTK Query owns server state and cache invalidation.
- Route-local React state owns active views, filters, modal state, and transient UI state.
- RTK Query tag types are `Note`, `Link`, `Task`, and `User`.

Protected requests use:

```http
Authorization: Token <token>
```

Registration, login, and both password-reset endpoints are public. Other API endpoints require authentication.

## Backend Domain Model

- `Note`: a note or folder. Folders use `is_folder=True`; nested membership uses the self-referencing `folder` field.
- `Link`: a user-owned directed connection between two note/folder records.
- `Status`: legacy status lookup retained by the backend.
- `TaskBoardColumn`: a user-owned Kanban column with explicit order.
- `Task`: title, description, optional regular note link, optional board column and position, status, priority, optional schedule, all-day flag, optional deadline, and completion timestamp.
- `TaskChecklistItem`: ordered checklist entry belonging to a task.
- `Profile`: phone number, IANA timezone, and push-enabled preference.
- `WebPushSubscription`: one browser/device push endpoint and its public subscription keys.
- `PushEvent`: durable, deduplicated daily-summary or deadline event.
- `PushDeliveryAttempt`: per-event and per-subscription delivery state used for retries and auditability.

Important invariants:

- Every query is scoped to the authenticated user.
- Tasks may link to regular notes, not folders.
- A task is on the Kanban board only when `board_column` is set.
- `due_date` and `deadline` are optional; board-only tasks can exist without either.
- Redis is not the source of truth for notification events.

## Backend Endpoints

Public auth:

- `POST /api/register/`
- `POST /api/login/`
- `POST /api/password-reset/request/`
- `POST /api/password-reset/confirm/`

Protected auth/profile:

- `POST /api/logout/`
- `GET /api/current-user/`
- `PUT /api/update-profile/`

Notes, folders, and links:

- `GET|POST /api/notes/`
- `GET|PUT|DELETE /api/notes/<id>/`
- `GET|POST /api/folders/`
- `GET|PUT|DELETE /api/folders/<id>/`
- `GET|POST /api/links/`
- `GET|DELETE /api/links/<id>/`

Tasks and Kanban:

- `GET|POST /api/tasks/`
- `GET|PATCH|PUT|DELETE /api/tasks/<id>/`
- `POST /api/tasks/<id>/move-to-board-column/`
- `GET|POST /api/task-board/columns/`
- `PATCH|DELETE /api/task-board/columns/<id>/`

Push notifications:

- `GET|PUT /api/push/settings/`
- `POST /api/push/subscriptions/`
- `POST /api/push/unsubscribe/`

## Notes, Folders, and Graph

Notes and folders use one backend table. `FoldersPage` renders nested folders and notes through `FolderBrowser`, `DroppableFolder`, and `DraggableNote`. `NotesPage` renders the D3 graph through `NoteGraph`, `NotesReader`, and `NotesToolbar`.

The graph supports selecting notes and folders, opening the appropriate reader, editing and deleting, and creating directed links between nodes. Linked task previews appear only for regular notes.

Markdown is stored in `Note.text`. Rendering uses `MarkdownViewer`; editing uses `MarkdownEditor`. Raw HTML is not enabled, and rendered images must remain inside their note container.

## Tasks and Kanban

The task page supports four views:

- `week`: scheduled tasks arranged by day, including drag-and-drop.
- `calendar`: dense month-style date grid.
- `all`: filtered task list.
- `board`: user-created Kanban columns.

Kanban starts without default columns. Users create, rename, collapse, and delete columns. Regular tasks are not added automatically; users may import a task into a selected column. Creating a task from a column creates it directly on the board and does not require a date or time. Deleting a non-empty column requires an explicit choice: delete its tasks or detach them from the board.

Task links use:

```text
/tasks?view=week&date=YYYY-MM-DD&task=<task-id>
```

Push-notification clicks use this route to open the relevant task context.

## Transactional Email and Password Reset

Django sends multipart transactional email through the configured SMTP server:

- Welcome email after registration.
- Password reset link after a valid recovery request.
- Password-changed security notification after successful reset.

The reset request returns a generic response whether or not the address belongs to an account, reducing account enumeration risk. Per-IP and per-email cache-backed limits protect the request endpoint. Reset links use Django's signed user token flow and `PUBLIC_APP_URL`. A successful reset deletes all DRF tokens for the user, forcing every existing session to authenticate again.

Production sends from `no-reply@pomn1.ru` through Mailcow. Credentials remain only in the production `.env`.

## Web Push Architecture

Web Push is opt-in from the profile page. The permission prompt occurs only after an explicit user action. Each browser/device has a separate `WebPushSubscription`.

Celery beat runs discovery every minute. Discovery creates durable, deduplicated MySQL events for:

- One local-time daily summary after 09:00 with today's and overdue task counts.
- One reminder when a task deadline enters the next 24 hours.

The Celery worker sends events to all active device subscriptions. Successful attempts are not repeated; retryable failures remain recoverable; HTTP 404/410 removes only the expired subscription. Notification clicks open the task week route.

Redis is a transient broker with a small memory limit. MySQL events and delivery attempts allow worker or Redis restarts without losing the notification ledger.

## Docker Runtime

`docker-compose.yml` defines:

- `db`: MySQL 8 application database.
- `redis`: constrained Redis broker without durable business state.
- `backend`: Django API and migrations/cache-table initialization, served by Gunicorn on container port `8000`.
- `celery-worker`: single-concurrency push delivery worker using the backend image.
- `celery-beat`: periodic discovery scheduler using the backend image.
- `frontend`: built SPA served by nginx and the only host-published service in the default Compose stack; it proxies `/api/` to `backend:8000` over the Docker network.

Rebuild only affected services. Backend code shared with Celery may require rebuilding the backend image and recreating `backend`, `celery-worker`, and `celery-beat`; frontend-only changes require only `frontend`. The base `docker-compose.yml` does not publish backend port `8000` to the host. Direct `localhost:8000` access is available only through `docker-compose.local.yml` or split local development with `python manage.py runserver`.

## Responsive Constraints

- Desktop keeps the left navigation rail; mobile and tablet use a top icon bar.
- Shared phone modals are fullscreen below the mobile navigation.
- Graph reader keeps the desktop arrow, while mobile/tablet use a fullscreen panel and close button.
- Mobile/tablet task and folder filters are collapsible.
- Calendar density remains three columns on phones and five on tablets unless the product design changes.
- UI changes require desktop, tablet, and phone manual verification.

## Development Guidance

- Keep reusable UI in `shared/ui`.
- Keep domain logic in `entities/*/model` or a focused feature.
- Keep page-only orchestration in `pages`.
- Keep route-independent large visual blocks in `widgets`.
- Prefer aliases: `@shared`, `@entities`, `@features`, `@widgets`, `@pages`, and `@app`.
- Keep production secrets out of code, tracked examples, logs, tests, and plans.

## Validation

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
flake8 api/ backend/ --max-line-length=120 --exclude=migrations,__pycache__
```

Compose:

```bash
docker compose config --quiet
```

Run the smallest relevant checks first. Model changes require migration validation. User-visible changes require manual browser/device QA before the associated ExecPlan is completed.
