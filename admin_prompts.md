# BMS Admin Portal (Web)

Use this file to build the **BMS Admin Portal** from scratch using any coding agent (Claude CLI, Copilot coding agent, Cursor, etc.).  
You already have:

- `BMS_BRD.md` (business rules + admin scope)
- `admin_architectural_contract.md` (architecture + stack + folder structure + RBAC)
- `admin_wireframes.md` (all screens + UI behaviors)

This prompt set is intentionally patterned after the Provider mobile prompts: **PLAN once → IMPLEMENT module-by-module**.

---

## How to run with Claude CLI (recommended)

### Step 1 — PLAN (one time)
In Claude CLI **PLAN mode**, paste:
1) `admin_architectural_contract.md`
2) `admin_wireframes.md`
3) `BMS_BRD.md`
4) this file: `admin_prompts.md` (optional, or paste only Prompt 0)

Then ask:
> “Confirm the implementation plan and order, confirm unknowns (API endpoints, auth/refresh, RBAC claims), and produce a checklist. Do not write code yet.”

### Step 2 — IMPLEMENT (module-by-module)
Switch to **IMPLEMENT mode** and paste prompts below **in order**, one at a time.

---

## Global Constraints (apply to EVERY prompt)

1) **Architecture is law:** Do not change folder structure, naming, patterns, or stack from `admin_architectural_contract.md`.
2) **Env config:** MUST read API base URL from `VITE_API_URL` or `REACT_APP_API_URL` (fallback order defined in contract). No hardcoded base URLs.
3) **Auth (recommended):** Access token + refresh token. Store tokens via `StorageService` (localStorage). Never store tokens in Redux state.
4) **Data fetching:** Use **RTK Query** for server state. No direct `fetch/axios` calls inside React components.
5) **RBAC enforced:** Must hide sidebar items + guard routes + hide action buttons based on permissions.
6) **Critical actions require confirmation dialogs** and must record “reason/notes” when required (reject, force cancel, mark failed, etc.).
7) **Deliverable at end of each prompt:** agent must output:
   - Files created/modified (list)
   - How to run: `npm install`, `npm run dev`
   - Manual test checklist for that module
8) **Quality gate after each prompt:**
   - `npm run build` passes (or a short TODO list for unavoidable build issues)
   - core navigation to built screens works
   - RBAC guard does not break routing

---

## Prompt 0 — Create Web Project + Baseline Dependencies + App Entry

**Paste into coding agent (IMPLEMENT mode):**

You are building a **BMS Admin Portal** from scratch.

You must follow:
- `admin_architectural_contract.md` (stack + structure)
- `admin_wireframes.md` (screens + routing + behaviors)

### Objective
Create a runnable Vite + React + TypeScript project with:
- required dependencies installed
- base folder structure under `src/` exactly like the contract
- app entry (`main.tsx`, `app.tsx`)
- routing scaffold + placeholder pages
- react-bootstrap + bootstrap global setup
- toast container setup

### Requirements
1) Initialize project: Vite React TS.
2) Install required deps (minimum):
   - react-router-dom
   - react-bootstrap + bootstrap
   - @reduxjs/toolkit + react-redux
   - react-toastify
   - react-hook-form + zod + @hookform/resolvers
   - dayjs
   - jwt-decode
3) Create `src/core/configs/env.ts` that resolves:
   - `VITE_API_URL` first
   - else `REACT_APP_API_URL`
   - else throw in dev
4) Create minimal routing:
   - `/login` → Login placeholder
   - `/` → Dashboard placeholder (protected)
   - `/not-authorized` placeholder
5) Add a basic `AdminLayout` with sidebar + top bar placeholders.
6) Ensure bootstrap CSS is loaded in `main.tsx` (or `main.tsx` imports).

### Acceptance Criteria
- `npm run dev` launches.
- `/login` loads.
- Attempting `/` redirects to `/login` (guard stub for now).
- No TS errors.

Return:
- file list changed
- run instructions
- manual tests

---

## Prompt 1 — Core UI Components + Layout Shell

**Paste into coding agent (IMPLEMENT mode):**

### Objective
Implement reusable UI components and shell layouts defined in contract.

### Must Implement
Under `src/core/ui/`:
1) `layouts/auth_layout.tsx`
2) `layouts/admin_layout.tsx`:
   - sidebar
   - top bar with: theme toggle, language selector (stub), profile menu (stub)
3) Common components:
   - `loader.tsx`
   - `empty_state.tsx`
   - `error_state.tsx`
   - `confirm_dialog.tsx`
   - `pagination.tsx`
4) Add `ToastContainer` placement in `app.tsx` (global).

### Rules
- Use react-bootstrap components only.
- Keep components generic, reusable.

### Acceptance Criteria
- A placeholder protected page renders inside AdminLayout.
- ErrorState/EmptyState can be displayed in demo page.
- ConfirmDialog works (show/hide).

Return:
- changed files list
- run instructions
- manual tests

---

## Prompt 2 — Store Setup (RTK + RTK Query) + Typed Hooks

**Paste into coding agent (IMPLEMENT mode):**

### Objective
Set up Redux store, RTK Query base API slice, and typed hooks.

### Must Implement
1) `src/core/store/store.ts`, `root_reducer.ts`, `hooks.ts`
2) `src/core/api/base_query.ts`:
   - fetchBaseQuery (or custom) with baseUrl from env
   - attach `Authorization` header if token exists (use StorageService)
3) `src/core/api/api_slices.ts` root API slice (empty endpoints initially)
4) Wire store into `main.tsx` using `<Provider store={store}>`

### Acceptance Criteria
- App compiles.
- You can create a demo RTK Query endpoint (e.g., GET /health) behind a feature flag or mocked path.
- No circular imports.

Return:
- changed files list
- run instructions
- manual tests

---

## Prompt 3 — StorageService + AuthService + Token Refresh Strategy

**Paste into coding agent (IMPLEMENT mode):**

### Objective
Implement recommended auth storage and refresh strategy.

### Must Implement
1) `src/core/services/storage_service.ts`
   - get/set/remove:
     - access token
     - refresh token
     - admin user snapshot
2) `src/core/services/auth_service.ts`
   - login(email, password)
   - logout()
   - refresh()
3) Update `base_query.ts` to:
   - on 401, attempt refresh once
   - retry original request
   - if refresh fails → logout and redirect to /login

### Notes
- If backend endpoints are unknown, implement `AuthService` methods with TODO stubs and simulated responses (mock mode), but keep interfaces stable.

### Acceptance Criteria
- Login can store tokens (mocked).
- Refresh logic path exists (even if mock).
- Logout clears tokens.

Return:
- changed files list
- run instructions
- manual tests

---

## Prompt 4 — RBAC: Permission Catalog + RBAC Service + Route Guards

**Paste into coding agent (IMPLEMENT mode):**

### Objective
Implement RBAC enforcement across navigation + routes + actions.

### Must Implement
1) `src/core/constants/permission_keys.ts`
   - include permissions from `admin_architectural_contract.md`
2) `src/core/services/rbac_service.ts`
   - `hasPermission`, `hasAny`, `hasAll`
   - permissions sourced from decoded token claims OR stored user snapshot
3) `src/core/navigation/route_guard.tsx`
   - supports:
     - authentication check
     - optional `requiredPermissions`
4) Update routing so:
   - `/` is protected
   - `/not-authorized` works
5) Update sidebar in `AdminLayout` to hide nav items if missing permission.

### Acceptance Criteria
- You can simulate permissions (mock user snapshot) and verify:
  - unauthorized route redirects to /not-authorized
  - sidebar hides restricted items
- No permission = can still log in but sees limited nav.

Return:
- changed files list
- run instructions
- manual tests

---

## Prompt 5 — Auth Pages (Login + Forgot + OTP + Reset Password)

**Paste into coding agent (IMPLEMENT mode):**

### Objective
Implement auth pages UI per wireframes with form validation and mock API calls.

### Must Implement Pages
- Login (`/login`)
- Forgot password (`/forgot-password`)
- Reset OTP (`/reset-otp`)
- Reset password (`/reset-password`)

### Must Implement
- `features/auth/pages/*`
- React Hook Form + Zod validation
- AuthService integration (mock ok)
- On login success: route to `/`

### Acceptance Criteria
- All auth routes render.
- Validation works.
- Successful login stores tokens + routes to Dashboard.
- Logout from profile menu returns to Login.

Return:
- changed files list
- run instructions
- manual tests

---

## Prompt 6 — Dashboard (KPIs + Pending Queues)

**Paste into coding agent (IMPLEMENT mode):**

### Objective
Implement Admin dashboard UI per BRD/wireframes.

### Must Implement
- `features/dashboard/pages/dashboard_page.tsx`
- KPI cards layout (mock data initially)
- Quick queue cards linking to:
  - Pending Providers
  - Pending Locations
  - Pending Facilities
  - Pending Disputes
  - Pending Settlements

### Data
- Use RTK Query endpoints with mock fallback or dummy JSON for now.

### Acceptance Criteria
- Dashboard renders in AdminLayout.
- Queue cards navigate to corresponding list routes (placeholders allowed if not built yet).

Return:
- changed files list
- run instructions
- manual tests

---

## Prompt 7 — Approvals: Providers (List + Detail + Approve/Reject)

**Paste into coding agent (IMPLEMENT mode):**

### Objective
Build Provider approvals module end-to-end with RBAC-gated actions.

### Must Implement Routes/Pages
- `/approvals/providers`
- `/approvals/providers/:providerId`

### UI Requirements
List:
- filters (status, active)
- search (name/email/CNIC)
- table + pagination

Detail:
- provider info + CNIC front/back images
- approve/reject buttons
- reject reason required
- audit log panel placeholder

### Data
- RTK Query endpoints:
  - list providers (pending/all)
  - get provider detail
  - approve provider
  - reject provider

### Acceptance Criteria
- Approve/reject updates UI and returns to list (or refresh detail).
- Buttons hidden if permission missing.
- Confirm dialogs used for approve/reject.

Return:
- changed files list
- run instructions
- manual tests

---

## Prompt 8 — Approvals: Locations (List + Detail + Approve/Reject)

**Paste into coding agent (IMPLEMENT mode):**

### Objective
Build Location approvals module end-to-end.

### Must Implement Routes/Pages
- `/approvals/locations`
- `/approvals/locations/:locationId`

### UI Requirements
- list with filters/search/pagination
- detail page with location images, address, provider link, papers/doc previews
- approve/reject with reason on reject
- audit log placeholder

### Acceptance Criteria
- Approve/reject works (mock ok).
- RBAC gating applied.

Return:
- changed files list
- run instructions
- manual tests

---

## Prompt 9 — Approvals: Facilities (List + Detail + Approve/Reject)

**Paste into coding agent (IMPLEMENT mode):**

### Objective
Build Facility approvals module end-to-end.

### Must Implement Routes/Pages
- `/approvals/facilities`
- `/approvals/facilities/:facilityId`

### UI Requirements
- facility images
- provider/location link
- schedule overview read-only section
- approve/reject actions
- audit log placeholder

### Acceptance Criteria
- Approve/reject works (mock ok).
- RBAC gating applied.

Return:
- changed files list
- run instructions
- manual tests

---

## Prompt 10 — Bookings Oversight (List + Detail + Force Cancel)

**Paste into coding agent (IMPLEMENT mode):**

### Objective
Implement bookings governance features.

### Must Implement Routes/Pages
- `/bookings`
- `/bookings/:bookingId`

### UI Requirements
List:
- filters: status, payment, type, date range
- search: bookingId, consumer/provider
- table + pagination

Detail:
- booking info, parties, venue, slot, payment, amounts
- **Force Cancel** action:
  - confirm dialog
  - reason required
  - disabled if already completed/cancelled (recommended)
- audit log panel placeholder

### Data
- RTK Query endpoints for list/detail/forceCancel

### Acceptance Criteria
- Force cancel updates booking status and refreshes list/detail.
- RBAC gating for force cancel.

Return:
- changed files list
- run instructions
- manual tests

---

## Prompt 11 — Disputes (List + Detail + Close + Refund Approve/Reject)

**Paste into coding agent (IMPLEMENT mode):**

### Objective
Implement dispute handling and refund decision workflow per BRD.

### Must Implement Routes/Pages
- `/disputes`
- `/disputes/:disputeId`

### UI Requirements
List:
- filters: status active/closed, date range, provider
- search: disputeId/bookingId/consumer
- table + pagination

Detail:
- dispute subject/description/attachments
- related booking card + link to booking
- close dispute with resolution notes (required)
- refund decision panel (only if applicable):
  - **Mark Refund Approved**
  - **Mark Refund Rejected** (reason required)
- note: portal does NOT execute refund; backend handles

### Acceptance Criteria
- Close dispute moves to closed (mock ok).
- Refund approve/reject updates status (mock ok).
- RBAC gating applied.

Return:
- changed files list
- run instructions
- manual tests

---

## Prompt 12 — Accounts: Settlements (List + Detail + Generate + Mark Paid/Failed)

**Paste into coding agent (IMPLEMENT mode):**

### Objective
Implement settlements administration screens.

### Must Implement Routes/Pages
- `/accounts/settlements`
- `/accounts/settlements/:settlementId`

### UI Requirements
List:
- filters: status, provider, period
- table + pagination
- generate settlements modal (period start/end) (permission gated)

Detail:
- summary breakdown
- mark paid (confirm)
- mark failed (confirm + reason required)
- audit log placeholder

### Acceptance Criteria
- Generate action visible only with permission.
- Mark paid/failed visible only with permission.
- UI refreshes after actions.

Return:
- changed files list
- run instructions
- manual tests

---

## Prompt 13 — Subscriptions: Plans + Provider Subscriptions + Requests

**Paste into coding agent (IMPLEMENT mode):**

### Objective
Implement subscriptions management.

### Must Implement Routes/Pages
- `/subscriptions/plans`
- `/subscriptions/plans/new`
- `/subscriptions/plans/:planId/edit`
- `/subscriptions/providers`
- `/subscriptions/requests`

### UI Requirements
Plans:
- list + create/edit form (react-hook-form + zod)
- monetization model selection
- activate/inactivate

Provider subscriptions:
- list with status (active/expired/expiring)
- assign plan modal

Requests:
- list + detail approve/reject + notes

### Acceptance Criteria
- Plan form validation works.
- Assign plan modal works (mock ok).
- RBAC gating on manage actions.

Return:
- changed files list
- run instructions
- manual tests

---

## Prompt 14 — Notifications: Compose + History

**Paste into coding agent (IMPLEMENT mode):**

### Objective
Implement admin notification sending tools.

### Must Implement Routes/Pages
- `/notifications/compose`
- `/notifications/history`

### UI Requirements
Compose:
- audience selection + optional filters
- title + message + deep link
- send now
History:
- list + filters/search
- notification detail view modal/page (optional)

### Acceptance Criteria
- Send action shows success toast and appears in history (mock ok).
- RBAC gating applied.

Return:
- changed files list
- run instructions
- manual tests

---

## Prompt 15 — Reports (Generate/Export)

**Paste into coding agent (IMPLEMENT mode):**

### Objective
Implement reports generation/export UI.

### Must Implement Route/Page
- `/reports`

### UI Requirements
- report type selection
- date range
- export format
- generate/export action
- show result link or queued message

### Acceptance Criteria
- RBAC gating applied.
- Form validation works.
- Generates mock report link.

Return:
- changed files list
- run instructions
- manual tests

---

## Prompt 16 — Users + Roles (RBAC Admin)

**Paste into coding agent (IMPLEMENT mode):**

### Objective
Implement user management and role management.

### Must Implement Routes/Pages
- `/users`
- `/users/:userId`
- `/users/:userId/edit`
- `/roles`
- `/roles/new`
- `/roles/:roleId/edit`

### UI Requirements
Users:
- list with role/status filters + search + pagination
- view + edit + deactivate

Roles:
- list + create/edit with permissions checklist grouped
- deactivate role

### Acceptance Criteria
- Permission checklist aligns with `permission_keys.ts`.
- RBAC gating for managing roles is enforced.

Return:
- changed files list
- run instructions
- manual tests

---

## Prompt 17 — Entity Management Pages (Consumers/Providers/Locations/Facilities)

**Paste into coding agent (IMPLEMENT mode):**

### Objective
Implement management lists (non-approval) for core entities.

### Must Implement
- `/consumers`
- `/providers` + `/providers/:providerId`
- `/locations` + `/locations/:locationId`
- `/facilities` + `/facilities/:facilityId`

### Acceptance Criteria
- Lists paginate and link to details.
- Deactivate actions are confirmation gated.
- Provider detail links to locations/facilities/subscription summary.

Return:
- changed files list
- run instructions
- manual tests

---

## Prompt 18 — Profile (Admin) + Theme + Language Persistence

**Paste into coding agent (IMPLEMENT mode):**

### Objective
Implement admin profile page and persist theme/language.

### Must Implement
- `/profile` with tabs:
  - profile info
  - edit info
  - change password
- `ThemeService` (localStorage persistence)
- language persistence (stub; no full i18n required)

### Acceptance Criteria
- Theme toggle works globally and persists after refresh.
- Change password form validates and calls API (mock ok).
- Logout clears session.

Return:
- changed files list
- run instructions
- manual tests

---

## Prompt 19 — Replace Mock APIs with Real Backend (When API Spec/Endpoints Ready)

**Paste into coding agent (IMPLEMENT mode) ONLY when backend endpoints are finalized:**

### Objective
Integrate real backend APIs across modules.

### Must Implement
1) Replace mock endpoints with real RTK Query endpoints for:
   - auth (login/refresh/logout)
   - approvals (providers/locations/facilities)
   - bookings (list/detail/force cancel)
   - disputes (list/detail/close/refund decision)
   - settlements (generate/mark paid/failed)
   - subscriptions (plans, assign, requests)
   - notifications (compose/history)
   - users/roles
2) Ensure refresh-on-401 works and does not infinite loop.
3) Add standard DTO types under `core/dtos` and map responses.

### Acceptance Criteria
- Login works with backend.
- Protected routes work with real permissions from token/user profile.
- Core flows function end-to-end.

Return:
- changed files list
- run instructions
- manual tests

---

## Prompt 20 — Hardening Pass (UX + Quality + Tests)

**Paste into coding agent (IMPLEMENT mode):**

### Objective
Polish and harden:
- consistent loading/empty/error states across all pages
- table pagination consistency
- confirm dialogs for all destructive actions
- add basic tests (vitest):
  - rbac_service permission checks
  - route_guard behavior (authorized vs not)
  - env base url resolution

### Acceptance Criteria
- `npm run build` passes.
- `npm run test` passes (basic tests).
- No obvious navigation dead ends.

Return:
- changed files list
- run instructions
- manual tests + test commands

---