# Архитектура Pomni

## Обзор

Pomni — SPA-приложение на React с бэкендом на Django REST Framework. Фронтенд построен по методологии **Feature-Sliced Design (FSD)**, состояние управляется через **Redux Toolkit + RTK Query**.

---

## Feature-Sliced Design

### Слои и зависимости

```
app → pages → widgets → features → entities → shared
```

Зависимости идут **только сверху вниз**. Запрещено:
- Зависимости снизу вверх
- Зависимости между модулями одного слоя
- Пропуск слоёв

### Структура слоёв

#### `app/` — Инициализация приложения
Точка входа, провайдеры, роутинг. Не содержит бизнес-логики.

```
app/
├── providers/
│   ├── ReduxProvider/    # Redux store конфигурация
│   ├── Router/           # React Router (AppRoutes)
│   └── UserInit/         # Восстановление сессии при старте
├── styles/               # Глобальные стили
└── index.js              # Точка входа (<App />)
```

#### `pages/` — Страницы приложения
Композиция виджетов и фич для конкретных маршрутов. Каждая страница — отдельный модуль.

```
pages/
├── Auth/            # Страница входа
├── home/            # Лендинг
├── registration/    # Регистрация
├── Notes/           # Граф заметок
├── folders/         # Файловая структура заметок
├── Profile/         # Личный кабинет
└── Tasks/           # Управление задачами
```

#### `widgets/` — Композиционные блоки
Крупные самостоятельные блоки страницы, которые можно переиспользовать между страницами.

```
widgets/
├── header/          # Шапка
├── footer/          # Подвал
├── navigation/      # Боковая навигация
└── note-graph/      # Визуализация графа (D3.js)
```

#### `features/` — Бизнес-сценарии
Интерактивные части, которые реализуют конкретные действия пользователя.

```
features/
├── auth-by-login/
│   ├── model/
│   │   ├── authSlice.js     # Redux slice (token, user, isAuthenticated)
│   │   └── selectors.js     # Селекторы к auth-состоянию
│   └── ui/
│       └── LoginForm/       # Форма входа
├── auth-by-registration/
│   └── ui/
│       └── RegistrationForm/
├── create-note-toggle/      # Создание заметки
├── edit-item/               # Редактирование заметок/папок
└── ...
```

#### `entities/` — Бизнес-сущности
Модели предметной области.

```
entities/
└── user/
    └── model/
        └── selectors.js     # Переиспользуемые селекторы (selectCurrentUser, selectIsAuthenticated)
```

#### `shared/` — Переиспользуемый код
Нижний слой, не зависит ни от чего выше.

```
shared/
├── api/
│   └── index.js             # RTK Query API (все endpoints, 401 interceptor)
├── config/
│   ├── routes.js            # Маршруты (routes.home, routes.auth, ...)
│   └── index.js
└── ui/
    ├── Button/
    ├── Input/
    ├── Modal/
    ├── Loader/
    ├── ProtectedRoute/      # Auth guard
    └── PhoneInput/          # Маска телефона
```

---

## Управление состоянием

### Redux Store

```js
// app/providers/ReduxProvider/store.js
const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,  // RTK Query кэш
    auth: authReducer,                // authSlice
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});
```

### Auth Slice

| State | Описание |
|-------|----------|
| `token` | JWT-токен из localStorage |
| `user` | Объект пользователя (id, username, email, phone_number) |
| `isAuthenticated` | Булев флаг авторизации |
| `loading` | Флаг загрузки (login pending) |
| `error` | Ошибка авторизации |

**Actions:**
- `setToken(payload)` — сохранить токен
- `setUser(payload)` — сохранить данные пользователя
- `logout()` — полный выход (очистка state + localStorage)
- `clearError()` — сброс ошибки

**extraReducers:** автоматически реагируют на RTK Query actions `login/pending`, `login/fulfilled`, `login/rejected`, `logout/fulfilled`.

### RTK Query (API слой)

Все API-запросы через единый `createApi` в `shared/api/index.js`.

**Tag Types:** `Note`, `Folder`, `User` — для автоматического кэширования и инвалидации.

**401 Interceptor:** кастомный `baseQueryWithReauth` перехватывает 401 ответы:
1. Dispatch `logout()` — очистка Redux-состояния
2. `window.location.href = routes.auth` — редирект на вход

---

## Контроль сессии

### Поток аутентификации

```
┌─────────────────────────────────────────────────────────┐
│                    Приложение стартует                   │
│                                                         │
│  1. UserInit проверяет localStorage                     │
│     ├── Токен есть → GET /current-user/                 │
│     │   ├── 200 → dispatch(setToken + setUser)          │
│     │   └── 401   → dispatch(logout), очистка storage   │
│     └── Токена нет → dispatch(logout)                   │
│                                                         │
│  2. Пока UserInit грузит → показывает <Loader />        │
│                                                         │
│  3. ProtectedRoute проверяет isAuthenticated:           │
│     ├── true  → рендерит дочерний маршрут               │
│     ├── false → <Navigate to="/auth" />                 │
│     └── null  → <Loader /> (ждёт UserInit)              │
└─────────────────────────────────────────────────────────┘
```

### Компоненты

| Компонент | Слой | Назначение |
|-----------|------|------------|
| **ProtectedRoute** | `shared/ui` | Guard для приватных маршрутов. Использует `<Outlet />` из React Router v6 |
| **UserInit** | `app/providers` | Восстановление сессии из localStorage. Блокирует рендер пока не завершит |
| **baseQueryWithReauth** | `shared/api` | Перехват 401 от API, автоматический logout |

### Роутинг

```jsx
<Routes>
  {/* Публичные */}
  <Route path="/" element={<HomePage />} />
  <Route path="/auth" element={<AuthPage />} />
  <Route path="/registration" element={<RegistrationPage />} />

  {/* Приватные — под единым guard */}
  <Route element={<ProtectedRoute />}>
    <Route path="/notes" element={<NotesPage />} />
    <Route path="/folders" element={<FoldersPage />} />
    <Route path="/profile" element={<ProfilePage />} />
    <Route path="/tasks" element={<TasksPage />} />
  </Route>

  {/* 404 */}
  <Route path="*" element={<div>Страница не найдена</div>} />
</Routes>
```

### Токен

- **Хранение:** `localStorage.getItem('token')`
- **Формат заголовка:** `Authorization: Token <token>` (Django Token Auth)
- **Источник истины:** Redux `state.auth.isAuthenticated`
- **Инициализация:** из localStorage при старте приложения

---

## Телефонный ввод

### PhoneInput

Компонент в `shared/ui/PhoneInput/` с маской `+7(XXX)-XXX-XX-XX`.

**Принцип работы:**
- Хранит **чистые цифры** (`79991234567`) в родительском state
- Отображает **отформатированную строку** (`+7(999)-123-45-67`)
- `inputMode="numeric"` — цифровая клавиатура на мобильных
- Функции `formatPhone()` / `unformatPhone()` экспортируются для использования в валидации

**Бэкенд валидация:**
- `validate_phone()` в `backend/api/validators.py` — извлекает только цифры, проверяет длину = 11 и начало с `7`
- В БД хранятся **чистые цифры**

---

## Бэкенд архитектура

### Django REST Framework

**Аутентификация:** TokenAuthentication (стандартная DRF)

**Модели:**
| Модель | Поля |
|--------|------|
| `Folder` | title, path, parent (FK self), user (FK User), created_at |
| `Note` | title, text, folder (FK Folder), user (FK User), created_at |
| `Link` | folder (FK), note (FK) |
| `Profile` | user (OneToOne User), phone_number |

**Endpoints:**
- `POST /api/register/` — регистрация
- `POST /api/login/` — вход, возврат токена
- `POST /api/logout/` — выход (удаление токена)
- `GET /api/current-user/` — данные текущего пользователя
- `PUT /api/update-profile/` — обновление профиля
- `GET/POST/PUT/DELETE /api/notes/` и `/api/notes/<id>/` — CRUD заметок
- `GET/POST/PUT/DELETE /api/folders/` и `/api/folders/<id>/` — CRUD папок

Все endpoints кроме login/register требуют `Authorization: Token <token>`.

---

## Инфраструктура

### Docker

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  frontend   │────▶│   backend    │────▶│    MySQL    │
│  (port 3000)│     │  (port 8000) │     │ (port 3306) │
└─────────────┘     └──────────────┘     └─────────────┘
```

- `frontend` — Node.js 18, CRACO build, serve в production
- `backend` — Python 3.11, Django + mysqlclient
- `db` — MySQL 8.0 с healthcheck

### Переменные окружения

**Frontend:**
```env
REACT_APP_API_URL=/api    # Production (через nginx proxy)
REACT_APP_API_URL=http://localhost:8000/api  # Local dev
```

**Backend:**
```env
DB_HOST=db
DB_NAME=Pomni
DB_USER=pomni
DB_PASSWORD=pomnipassword
```
