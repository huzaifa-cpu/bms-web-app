# BMS Admin Portal (Web) — Architectural Contract

This document is the **single source of truth** for the Admin web app architecture.

---
## 1) ENVIRONMENT SPECIFICATION

### 1.1 Runtime & Tooling (Pinned)

- **Node.js:** >= 18.x (LTS)
- **Package Manager:** npm
- **Framework:** React 18+
- **Language:** TypeScript (**required**, upgrade)
- **Build Tool:** Vite (**upgrade from CRA**)
- **Routing:** react-router-dom v6+
- **UI:** react-bootstrap + bootstrap (keep the example’s UI approach, but modernize build stack)
- **State:** Redux Toolkit (RTK) + RTK Query (**upgrade from redux + thunk**)
- **Linting/Formatting:** ESLint + Prettier

### 1.2 Environment Variables (Required)

Use `.env` with Vite conventions:

- `VITE_API_URL` (preferred)
- Also accept `REACT_APP_API_URL` **for compatibility** with your request / legacy pipelines.

**Rule:** Application must resolve base URL as:
1) `VITE_API_URL` if defined
2) else `REACT_APP_API_URL` if defined
3) else fail fast in dev with a clear error message

Example `.env`:
```bash
VITE_API_URL=https://api.bms.com
# OR
REACT_APP_API_URL=https://api.bms.com
```

### 1.3 Scripts

```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "test": "vitest",
  "lint": "eslint .",
  "format": "prettier . --write"
}
```

---

## 2) DEPENDENCY MANIFEST

> Versions should be pinned (or caret-pinned) in `package.json` and updated intentionally.

### 2.1 Production Dependencies

| Category | Library | Purpose |
|---|---|---|
| Core | `react`, `react-dom` | UI framework |
| Build | `vite` | Dev server + build |
| Language | `typescript` | Type safety |
| Routing | `react-router-dom` | Client-side routing (guards via wrappers) |
| UI | `react-bootstrap`, `bootstrap` | UI components & styling |
| State | `@reduxjs/toolkit`, `react-redux` | Global state + RTK slices |
| Data fetching | `@reduxjs/toolkit/query` | RTK Query for API calls, caching, pagination patterns |
| HTTP | `axios` | Optional (allowed for non-RTKQ endpoints, but prefer RTKQ) |
| Notifications | `react-toastify` | Toast notifications |
| Forms | `react-hook-form`, `zod`, `@hookform/resolvers` | Typed validation & form handling (upgrade) |
| Dates | `dayjs` | Dates/times formatting and comparisons |
| Tables | `react-bootstrap/Table` | Tables (keep simple); advanced table libs optional later |
| Auth utilities | `jwt-decode` | Decode access token claims for RBAC/UI guards |
| Icons | `react-icons` | Icon library |

### 2.2 Dev Dependencies

| Category | Library | Purpose |
|---|---|---|
| Lint | `eslint`, `@typescript-eslint/*` | Linting |
| Format | `prettier` | Formatting |
| Tests | `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event` | Unit/component tests |
| Types | `@types/*` | Type definitions |

---

## 3) REPOSITORY STRUCTURE (Exact Tree)

> Structure MUST follow **`core/` + `features/`** (same architectural spirit as mobile contract, adapted for web).

```
admin-portal/
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── .env.example
└── src/
    ├── main.tsx
    ├── app.tsx
    ├── core/
    │   ├── configs/
    │   │   ├── env.ts
    │   │   └── app_config.ts
    │   ├── constants/
    │   │   ├── app_constants.ts
    │   │   ├── routes.ts
    │   │   └── permission_keys.ts
    │   ├── dtos/
    │   │   ├── generic_response.ts
    │   │   └── paginated_response.ts
    │   ├── entities/
    │   │   ├── admin_user.ts
    │   │   ├── role.ts
    │   │   ├── permission.ts
    │   │   ├── provider.ts
    │   │   ├── consumer.ts
    │   │   ├── employee.ts
    │   │   ├── location.ts
    │   │   ├── facility.ts
    │   │   ├── booking.ts
    │   │   ├── dispute.ts
    │   │   ├── settlement.ts
    │   │   ├── ledger_entry.ts
    │   │   ├── subscription_plan.ts
    │   │   └── notification.ts
    │   ├── enums/
    │   │   ├── approval_status.ts           // pending | approved | rejected
    │   │   ├── booking_status.ts            // confirmed | in_progress | completed | cancelled
    │   │   ├── payment_status.ts            // pending | paid | failed | refunded
    │   │   ├── dispute_status.ts            // active | closed
    │   │   └── settlement_status.ts         // pending | processing | paid | failed
    │   ├── errors/
    │   │   ├── app_error.ts
    │   │   └── error_mapper.ts
    │   ├── services/
    │   │   ├── storage_service.ts           // token storage
    │   │   ├── auth_service.ts              // login/logout/refresh
    │   │   ├── rbac_service.ts              // permission checks
    │   │   └── services.ts                  // barrel exports
    │   ├── api/
    │   │   ├── base_query.ts                // RTK Query baseQuery with auth
    │   │   └── api_slices.ts                // root API slice + endpoints composition
    │   ├── store/
    │   │   ├── store.ts
    │   │   ├── root_reducer.ts
    │   │   └── hooks.ts                     // typed hooks
    │   ├── navigation/
    │   │   ├── route_guard.tsx
    │   │   └── app_router.tsx
    │   ├── ui/
    │   │   ├── layouts/
    │   │   │   ├── auth_layout.tsx
    │   │   │   └── admin_layout.tsx
    │   │   ├── components/
    │   │   │   ├── loader.tsx
    │   │   │   ├── empty_state.tsx
    │   │   │   ├── error_state.tsx
    │   │   │   ├── confirm_dialog.tsx
    │   │   │   └── pagination.tsx
    │   │   └── theme/
    │   │       ├── theme_service.ts
    │   │       └── theme_tokens.ts
    │   └── utils/
    │       ├── date_utils.ts
    │       ├── number_utils.ts
    │       └── utils.ts
    └── features/
        ├── auth/
        │   ├── api/
        │   ├── pages/
        │   ├── state/
        │   └── widgets/
        ├── dashboard/
        │   ├── api/
        │   ├── pages/
        │   └── widgets/
        ├── user_management/
        │   ├── api/
        │   ├── pages/
        │   ├── state/
        │   └── widgets/
        ├── consumers/
        ├── providers/
        ├── locations/
        ├── facilities/
        ├── bookings/
        ├── disputes/
        ├── accounts/
        ├── subscriptions/
        ├── notifications/
        ├── reports/
        └── profile/
```

### 3.1 Feature Module Template (Required)

Each feature MUST follow this template:

```
features/{feature_name}/
├── api/          # RTK Query endpoints (injectEndpoints) specific to this feature
├── pages/        # route-level screens
├── state/        # slices/selectors if needed (avoid duplicate server state)
└── widgets/      # reusable feature-local UI components
```

**Rule:** Server state is owned by RTK Query; avoid duplicating lists into slices unless strictly necessary (e.g., UI-only filter persistence).

---

## 4) CORE MODULES (Responsibilities)

### 4.1 `core/configs`
- `env.ts`
  - Reads base URL from `VITE_API_URL` or `REACT_APP_API_URL`
  - Exports `API_URL` (string)
- `app_config.ts`
  - App metadata, feature flags, default pagination sizes
  - Build-time toggles (e.g., enableMock = false)

### 4.2 `core/store`
- `store.ts` configures:
  - RTK slices
  - RTK Query API slice middleware
- `hooks.ts` exports typed:
  - `useAppDispatch`
  - `useAppSelector`

### 4.3 `core/api`
- RTK Query `baseQuery` must:
  - attach `Authorization: Bearer <accessToken>`
  - normalize errors via `error_mapper.ts`
  - handle 401 with refresh flow (see Auth)

### 4.4 `core/services/auth_service.ts` (Recommended Auth)
**Recommended:**
- **Access token + Refresh token**
- Store tokens in **memory + localStorage** (admin portal is web; for security, cookies are best, but requires backend support).
- If backend supports cookie sessions, prefer HttpOnly cookies; otherwise use refresh token approach.

**Required behaviors**
- `login(email, password)` → receive tokens + user payload
- `logout()` → clear storage
- `refresh()` → on 401, attempt refresh once, then retry original request; if refresh fails → logout

**Storage keys (single source of truth)**
- `bms_admin_access_token`
- `bms_admin_refresh_token`
- `bms_admin_user` (minimal claims snapshot)

### 4.5 `core/services/rbac_service.ts` (RBAC enforcement)
RBAC is mandatory (per your confirmation).

- `hasPermission(permissionKey: PermissionKey): boolean`
- `hasAny(permissions: PermissionKey[]): boolean`
- `hasAll(permissions: PermissionKey[]): boolean`

RBAC checks apply to:
1) **Route guards**
2) **UI action gating** (buttons like Approve/Reject/Force Cancel)
3) **API calls** (hide if missing; backend must still enforce)

### 4.6 `core/navigation`
- `app_router.tsx`
  - Defines route tree using react-router-dom
  - Wrap protected routes in `RouteGuard`
- `route_guard.tsx`
  - Enforces:
    - authenticated session
    - permission(s) required per route
    - fallback redirects (`/login`, `/not-authorized`)

### 4.7 `core/ui/layouts`
- `AuthLayout`: minimal layout for Login/Forgot/Reset
- `AdminLayout`: shell with sidebar + top bar:
  - language toggle
  - theme toggle
  - profile menu
  - logout

### 4.8 `core/errors`
- `app_error.ts`: normalized error model:
  - `code`, `message`, `details?`, `status?`
- `error_mapper.ts`: maps Axios/Fetch/RTKQ errors to `AppError`

---

## 5) PERMISSION CATALOG (Admin RBAC)

Define permissions in `core/constants/permission_keys.ts`.

Minimum permissions derived from BRD Admin scope:

### 5.1 Approvals
- `approvals.providers.view`
- `approvals.providers.approve`
- `approvals.providers.reject`
- `approvals.locations.view`
- `approvals.locations.approve`
- `approvals.locations.reject`
- `approvals.facilities.view`
- `approvals.facilities.approve`
- `approvals.facilities.reject`

### 5.2 Bookings Governance
- `bookings.view`
- `bookings.force_cancel`
- `bookings.force_complete` *(optional but recommended in BRD)*
- `bookings.adjust_time` *(optional; if implemented)*
- `bookings.mark_disputed` *(optional)*

### 5.3 Disputes & Refund Approvals
- `disputes.view`
- `disputes.respond`
- `disputes.close`
- `refunds.view`
- `refunds.approve`  ✅ **Admin only marks approved; backend executes**
- `refunds.reject`

### 5.4 Users & Roles
- `users.view`
- `users.edit`
- `users.deactivate`
- `roles.view`
- `roles.manage`

### 5.5 Accounts & Settlements
- `accounts.view`
- `settlements.view`
- `settlements.generate`
- `settlements.mark_paid`
- `settlements.mark_failed`

### 5.6 Subscriptions
- `subscriptions.view`
- `subscriptions.manage_plans`
- `subscriptions.assign_plan`
- `subscriptions.process_requests`

### 5.7 Notifications & Reports
- `notifications.compose`
- `notifications.view_history`
- `reports.view`
- `reports.export`

**Rule:** UI must hide actions when permission missing (preferred) and also block via route guard.

---

## 6) FEATURE MODULES (BRD-Aligned)

### 6.1 `features/auth`
**Pages**
- `LoginPage` (email/password)
- `ForgotPasswordPage` (send OTP/link)
- `OtpVerifyPage` (if OTP path)
- `ResetPasswordPage`
- `Logout` action (in layout)

**Rules**
- Lockouts/rate limits are backend-driven; UI shows friendly errors.

### 6.2 `features/dashboard`
BRD KPIs + queues:
- KPI cards:
  - users count, provider count, consumer count
  - locations count, facility count
  - today bookings, monthly bookings
  - today revenue
  - active locations/providers/facilities
- Quick links:
  - Pending Providers
  - Pending Locations
  - Pending Disputes
  - Pending Settlements

### 6.3 `features/user_management`
From BRD: “User Management → Users + Roles”

**Users**
- list/search/filter by role/status
- view/edit/deactivate
- delete should be restricted (optional; compliance risk)

**Roles**
- list/create/edit role
- permission checkboxes aligned to Permission Catalog
- deactivate role

### 6.4 `features/consumers`
- list/search/filter active/inactive
- view/edit/deactivate/delete
- fields: avatar, name, email, phone, sports category (from onboarding)

### 6.5 `features/providers`
- list/search by provider name/email/CNIC/business
- pending providers queue with approve/reject + notes
- provider detail: CNIC images/expiry/number, business info, subscription, locations/facilities count

### 6.6 `features/locations`
- all locations list + pending locations queue
- view/edit/inactive/delete
- approval decision with reason

### 6.7 `features/facilities`
- all facilities list + pending facilities queue
- view/edit/inactive/delete
- approval decision with reason
- schedule overview display (read-only in admin unless required)

### 6.8 `features/bookings`
System-wide bookings oversight:
- list with filters:
  - status, payment status, type (online/walk-in), date range
- booking detail:
  - IDs, consumer/provider/location/facility, slot, timestamps
  - payment details (txn id if online)
  - actions:
    - force cancel
    - (optional) force complete / adjust time
  - audit log panel

### 6.9 `features/disputes`
- list filters: active/closed, provider, date range
- dispute detail:
  - subject/description, linked booking
  - admin response thread (optional)
  - close dispute with resolution text/type
  - refund decision:
    - mark refund approved / rejected (backend executes)

### 6.10 `features/accounts`
Admin accounts oversight
- settlements list + period runs (generate)
- mark payout paid/failed (admin action)
- ledger audit view (optional)

### 6.11 `features/subscriptions`
- manage plans (CRUD)
- provider subscriptions list (expiring/expired filters)
- process renewal/upgrade requests

BRD rule: **Subscription expiry hides venue from consumer discovery**.

### 6.12 `features/notifications`
Admin compose + history:
- compose targeted/broadcast notifications
- filters: audience role + optional city/plan/active
- view sent notifications history

### 6.13 `features/reports`
- generate/export operational reports:
  - bookings by city/facility
  - revenue/commissions
  - utilization
  - disputes volume/resolution time
- export: CSV/PDF

### 6.14 `features/profile`
Admin profile tabs:
- profile info (avatar/name/email)
- edit info
- change password

---

## 7) STATE MANAGEMENT RULES (Admin Portal)

### 7.1 RTK Query as Default
- All server state (lists, details, filters-in-query) uses RTK Query.
- Use `providesTags/invalidatesTags` for consistency after mutations:
  - approve provider → invalidate providers pending list + provider detail
  - force cancel booking → invalidate bookings list + booking detail
  - close dispute → invalidate disputes list + dispute detail

### 7.2 UI-only state
Allowed in slices or local state:
- sidebar collapse
- theme/language selection
- persisted table column visibility (optional)
- last-used filters (optional)

### 7.3 Pagination Rules (Mandatory)
All large lists MUST be paginated:
- bookings, users, providers, locations, facilities, disputes, settlements, notifications history
- Paginated DTO standard:
  - `items[]`, `page`, `pageSize`, `totalItems`, `totalPages`

---

## 8) API LAYER PATTERN

### 8.1 Endpoint Ownership
- Feature endpoints must be defined in their feature `api/` folder via `injectEndpoints`.
- Never call `fetch` directly in components.

### 8.2 Auth Injection
`base_query.ts` attaches bearer token:
- `Authorization: Bearer <accessToken>`
- `Content-Type: application/json`

### 8.3 Refresh Token Handling (Recommended)
On `401`:
1) attempt refresh once
2) store new access token
3) retry original request
4) if refresh fails → logout and redirect `/login`

### 8.4 Error Normalization
All errors surfaced to UI as `AppError`:
- toast for transient failures
- `ErrorState` for page-level failures

---

## 9) ROUTING STRATEGY (RBAC + Guards)

### 9.1 Route Structure (Recommended)
- `/login`
- `/forgot-password`
- `/reset-password`
- `/` (dashboard)
- `/approvals/providers`
- `/approvals/locations`
- `/approvals/facilities`
- `/bookings`
- `/bookings/:bookingId`
- `/disputes`
- `/disputes/:disputeId`
- `/users`
- `/roles`
- `/providers`
- `/providers/:providerId`
- `/locations`
- `/facilities`
- `/accounts/settlements`
- `/subscriptions/plans`
- `/subscriptions/providers`
- `/notifications/compose`
- `/notifications/history`
- `/reports`
- `/profile`
- `/not-authorized`

### 9.2 Guard Rules
- Routes require authentication except auth pages
- Each route defines required permissions (at least one)
- If user lacks permission:
  - route guard redirects to `/not-authorized`
- UI must also hide navigation items the user cannot access

---

## 10) LAYOUT & THEMING

### 10.1 Shell Layout (AdminLayout)
- Sidebar navigation (permission-aware)
- Top bar:
  - language toggle
  - theme toggle
  - notifications shortcut (optional)
  - profile dropdown (profile, change password, logout)

### 10.2 Theme
- Use bootstrap default themes + minimal tokens
- Theme service persists preference to localStorage:
  - `bms_admin_theme = light | dark`
- Language persists:
  - `bms_admin_lang = en | ...`

---

## 11) NON-FUNCTIONAL REQUIREMENTS

1) Each page must include:
   - loading state
   - empty state
   - error state
2) All critical actions require confirmation:
   - approve/reject, deactivate, force cancel, close dispute, mark paid, etc.
3) Audit log visibility:
   - display audit events returned by backend for bookings/disputes/approvals (read-only)
4) Accessibility basics:
   - keyboard navigation in forms
   - proper labels for inputs
5) Security:
   - do not log tokens
   - avoid storing sensitive PII in localStorage beyond token/user minimal claims

---

## 12) CODING RULES FOR AI / DEV

### 12.1 UI Rules
1) Use react-bootstrap components for consistency
2) No inline styles for layout except rare cases; prefer utility classes + component props
3) Reusable UI elements must go in `core/ui/components`
4) Keep pages thin; extract complex blocks into `widgets/`

### 12.2 Data Rules
1) Use RTK Query hooks in pages/widgets
2) Do not duplicate server lists into slices
3) Mutations must invalidate correct tags

### 12.3 Error Handling Rules
1) Convert API errors to `AppError`
2) Show `toast.error(appError.message)` for transient errors
3) Show `ErrorState` for full-page failures with Retry button

### 12.4 RBAC Rules
1) Never rely on UI-only gating; backend must enforce too
2) UI must:
   - hide nav items without permission
   - hide action buttons without permission
   - guard routes without permission

---

## 13) FEATURE BUILD ORDER (Recommended)

1) Core foundation (env, store, api baseQuery, layouts, routing, auth)
2) RBAC (permission catalog + role parsing + guards + sidebar)
3) Dashboard (KPIs + quick queues)
4) Approvals: providers/locations/facilities
5) Bookings oversight (list + detail + force cancel)
6) Disputes (list + detail + close + refund approve/reject)
7) Subscriptions (plans + provider subscriptions + requests)
8) Accounts/Settlements (period runs + mark paid/failed)
9) Notifications (compose + history)
10) Reports + Profile polish

---

## 14) “MUST-NOT” LIST

- MUST NOT hardcode API base URLs in code (must use `VITE_API_URL` / `REACT_APP_API_URL`)
- MUST NOT store access tokens in Redux state
- MUST NOT bypass RBAC checks in navigation and routes
- MUST NOT call raw fetch/axios inside UI components (use RTK Query)
- MUST NOT implement “execute refund” in admin UI (only approve/reject; backend executes)
- MUST NOT implement destructive deletes without confirmation + permission + audit (prefer deactivate)

---
**END OF ADMIN ARCHITECTURAL CONTRACT**