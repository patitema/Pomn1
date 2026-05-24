# Pomni Architecture

Pomni is a React SPA with a Django REST API. The current frontend is organized around Feature-Sliced Design (FSD), and the old top-level frontend folders have been removed from `frontend/src`.

## Dependency Direction

Target dependency direction:

```text
app -> pages -> widgets -> features -> entities -> shared
```

Rules:

- `shared` must not import from upper layers.
- `entities` may use `shared`, but not `features`, `widgets`, or `pages`.
- `features` may use `entities` and `shared`.
- `widgets` compose `features`, `entities`, and `shared`.
- `pages` compose widgets/features for a route.
- Imports between modules should go through public `index.js` files where practical.

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
    create-folder/
    create-note/
    create-task/
    delete-folder/
    delete-note/
    delete-task/
    drag-and-drop-note/
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
    registration/
  shared/
    api/
    config/
    lib/
    ui/
  widgets/
```

## Layer Responsibilities

### `app`

Application bootstrap:

- Redux provider.
- Router.
- Session initialization through `UserInit`.
- Global styles.

### `pages`

Route-level composition and page state:

- `NotesPage` composes graph, reader, toolbar, and note/folder modals.
- `FoldersPage` composes the folder browser and drag-and-drop context.
- `TasksPage` owns task view state, filters, week/calendar/all views, and task modal orchestration.

If page logic becomes reusable domain logic, move it into `entities/*/model` or a feature/widget.

### `widgets`

Large UI blocks:

- `note-graph`
- `notes-reader`
- `notes-toolbar`
- `folder-browser`
- `folder-tree`
- `header`, `footer`, `navigation`

Widgets may compose lower layers and expose route-independent UI blocks.

### `features`

User scenarios:

- Auth forms.
- Create/update/delete note and folder flows.
- Task create/update/delete feature folders.
- Drag-and-drop note feature code.

Feature modules should not become page containers.

### `entities`

Domain modules:

- `user`: auth slice, selectors, user helpers.
- `note`: note/folder detection and note helpers.
- `folder`: folder tree helpers.
- `link`: graph/link helpers.
- `task`: linked task preview helpers and task URL helpers.

Entities should contain domain helpers, selectors, and small reusable entity UI.

### `shared`

Reusable infrastructure:

- `shared/api`: RTK Query API and auth-aware base query.
- `shared/config`: route constants.
- `shared/lib`: generic helpers such as date formatting.
- `shared/ui`: reusable UI primitives and Markdown components.

## State And API

State management:

- Redux Toolkit for global user/auth state.
- RTK Query for server state.
- Route-local React state for page view state and modal state.

RTK Query tag types:

- `Note`
- `Link`
- `Task`
- `User`

The API layer also performs 401 handling. When a protected endpoint returns 401, auth state is cleared and the user is redirected to `/auth`.

## Session Flow

1. `UserInit` checks `localStorage.getItem('token')`.
2. If a token exists, it calls `GET /api/current-user/`.
3. On success, Redux receives the token and user.
4. On missing/invalid token, local auth state is cleared.
5. `ProtectedRoute` guards `/notes`, `/folders`, `/tasks`, and `/profile`.

## Backend Model Overview

Main models:

- `Note`: unified note/folder record. Folders are notes with `is_folder=True`.
- `Link`: graph links between two `Note` records.
- `Task`: user task with title, description, status, priority, optional linked regular note, scheduled date, optional deadline, and completion timestamp.
- `Profile`: user profile extension with phone number.

Important task rule:

- Tasks may link to regular notes.
- Folders do not own tasks for now.
- UI task previews are shown only for regular notes.

## Backend Endpoints

Auth/profile:

- `POST /api/register/`
- `POST /api/login/`
- `POST /api/logout/`
- `GET /api/current-user/`
- `PUT /api/update-profile/`

Notes/folders/links:

- `GET|POST /api/notes/`
- `GET|PUT|DELETE /api/notes/<id>/`
- `GET|POST /api/folders/`
- `GET|PUT|DELETE /api/folders/<id>/`
- `GET|POST /api/links/`
- `GET|DELETE /api/links/<id>/`

Tasks:

- `GET|POST /api/tasks/`
- `GET|PATCH|PUT|DELETE /api/tasks/<id>/`

## Notes And Folders

Notes and folders are represented by the same backend model. On the frontend:

- `entities/note` contains helpers such as regular-note vs folder checks.
- `entities/folder` contains tree helpers.
- `FoldersPage` uses `FolderBrowser`, `DroppableFolder`, and `DraggableNote`.
- `NotesPage` uses `NoteGraph`, `NotesReader`, and `NotesToolbar`.

## Graph View

Graph view uses D3.js inside `widgets/note-graph`.

Current behavior:

- Shows notes and folders as nodes.
- Supports selecting a regular note to open the reader panel.
- Supports toolbar edit/delete actions.
- Supports a connection mode for creating links.
- Uses backend links and note data through RTK Query.

Follow-up work remains for richer folder reader behavior and manual QA of link creation.

## Tasks

Task functionality includes:

- Backend CRUD API.
- RTK Query endpoints.
- Week view.
- Calendar view.
- All-tasks list view.
- Filters by search, status, priority, date range, and linked note.
- Status transitions.
- Optional deadlines.
- Week drag-and-drop.
- Linked task previews in graph reader and file view for regular notes.

The Tasks page supports week navigation from other UI areas:

```text
/tasks?view=week&date=YYYY-MM-DD&task=<task-id>
```

The `task` parameter is currently used as navigation context. Highlighting can be added later.

## Markdown

Markdown support is implemented with:

- `shared/ui/MarkdownEditor`
- `shared/ui/MarkdownViewer`
- `@uiw/react-md-editor`
- `react-markdown`

Markdown is stored in `Note.text`. Backend changes are not required for Markdown itself.

## Development Guidance

- Keep new reusable UI in `shared/ui`.
- Keep domain helpers in `entities/*/model`.
- Keep page-only state in `pages`.
- Keep large route blocks in `widgets`.
- Do not reintroduce `components`, `context`, `hooks`, or `utils` at the root of `frontend/src`.
- Prefer aliases: `@shared`, `@entities`, `@features`, `@widgets`, `@pages`, `@app`.

## Validation

Frontend:

```bash
cd frontend
npx eslint src/ --max-warnings=0
npm run build
npm test -- --watchAll=false --passWithNoTests
```

Backend:

```bash
cd backend
python manage.py check
python manage.py migrate
```

Backend validation is required after changing models, serializers, views, or migrations.
