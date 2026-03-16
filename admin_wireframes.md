# BMS Admin Portal — Detailed Wireframes

This document defines **all Admin Portal screens** with:
- Screen name + route name
- Primary purpose
- UI components (sections + fields)
- States (loading/empty/error)
- Actions & navigation
- RBAC permission gating (where applicable)
- Audit logging expectations for critical actions

> Notes:
- Admin can **approve/reject**: Providers, Locations, Facilities.
- Admin can **force cancel bookings**.
- Refunds are **full only** (no partial refunds).
- Refund policy default:
  - **Full refund** if cancellation occurs **> 6 hours** before start time
  - **No refund** if **≤ 6 hours**
- Admin “refund handling” in portal = **mark approved/rejected** only; **backend executes** (per your confirmation).
- Subscription expiry: **hide venue from consumer discovery**.
- Audit logs exist for critical actions (approve/reject, force cancel, deactivate, refund decisions, role changes).

---

## 0) App Shell & Global UI Patterns

### 0.1 Global Layout (AdminLayout)
**Applies to:** all authenticated screens  
**Components**
- Left: Sidebar navigation (permission-aware)
- Top bar:
  - Search (global search)
  - Theme toggle (Light/Dark)
  - Language selector
  - Profile menu (Profile, Change Password, Logout)

**RBAC**
- Sidebar items are **hidden** if user lacks permission.
- Route guard blocks unauthorized access and routes to `/not-authorized`.

### 0.2 Common Components (reused)
- `Loader` (page-level loading)
- `InlineSpinner` (button-level)
- `ErrorState` (full-page error + Retry)
- `EmptyState` (empty list + optional CTA)
- `ConfirmDialog` (destructive/critical actions)
- `Toast` (success/error feedback)
- `Pagination` (page + size selector)
- `StatusBadge` (Approved/Pending/Rejected, Active/Inactive, Paid/Pending)
- `AuditLogPanel` (read-only timeline list, if API supports)

### 0.3 Global List Patterns (all list pages)
- Table with:
  - search input (debounced)
  - filters (chips/dropdowns)
  - pagination
  - row actions dropdown (View/Edit/Deactivate/etc.)
- Bulk actions are optional (not required)

### 0.4 Standard States (required per screen)
- **Loading:** skeleton rows or spinner
- **Empty:** clear message + “Reset filters”
- **Error:** error message + Retry
- **Success toasts:** consistent wording

---

## 1) Authentication (Admin)

### 1.1 Login
**Route:** `/login`  
**Purpose:** admin sign-in (email/password)

**UI Components**
- Logo + title “Admin Login”
- Email input
- Password input (eye toggle)
- CTA: **Login**
- Link: **Forgot password**

**Validations**
- Email required + valid format
- Password required

**States**
- Loading overlay on submit
- Error: invalid credentials / locked account → toast + inline error

**Actions**
- Login success → route to `/` (Dashboard)

**RBAC**
- Public page (no permission needed)

---

### 1.2 Forgot Password
**Route:** `/forgot-password`  
**Purpose:** request reset via OTP or link (backend decides)

**UI Components**
- Email input
- CTA: **Send**
- Helper text: “We’ll send a reset OTP/link to your email”
- Back to login

**States**
- Loading on submit
- Success toast: “Reset instructions sent”
- Error: email not found / server error

---

### 1.3 OTP Verification (if OTP mode)
**Route:** `/reset-otp`  
**Purpose:** verify OTP for password reset

**UI Components**
- 6-digit OTP input
- Timer + Resend
- CTA: **Verify**

**States**
- Loading
- Error: invalid/expired OTP
- Success → route to `/reset-password`

---

### 1.4 Reset Password
**Route:** `/reset-password`  
**Purpose:** set new password

**UI Components**
- New password
- Retype password
- Password policy hint
- CTA: **Update Password**

**States**
- Loading
- Error: mismatch/policy fail
- Success toast + route to `/login`

---

### 1.5 Logout Confirmation
**Route:** (modal from header)  
**Purpose:** confirm logout

**UI Components**
- Title: “Logout?”
- Buttons: Cancel / Logout

**Actions**
- Logout clears session → route to `/login`

---

## 2) Authorization / Not Authorized

### 2.1 Not Authorized
**Route:** `/not-authorized`  
**Purpose:** show access denied page when RBAC fails

**UI Components**
- Icon/illustration
- Title: “Not authorized”
- Text: “You don’t have permission to view this page.”
- CTA: Go to Dashboard

---

## 3) Dashboard

### 3.1 Dashboard
**Route:** `/`  
**Purpose:** operational overview + pending queues (BRD aligned)

**RBAC Permission**
- `dashboard.view` (recommended; if not defined, allow all admins)

**UI Components**
1) KPI Cards grid (clickable optional)
- Users count
- Provider count
- Consumer count
- Locations count
- Facility count
- Today’s bookings
- Monthly bookings
- Today revenue
- Active locations
- Active providers
- Active facilities

2) Quick Actions / Queues
- Card: Pending Providers → `/approvals/providers?status=pending`
- Card: Pending Locations → `/approvals/locations?status=pending`
- Card: Pending Facilities → `/approvals/facilities?status=pending`
- Card: Pending Disputes → `/disputes?status=active`
- Card: Pending Settlements → `/accounts/settlements?status=pending`

**States**
- Loading: KPI skeletons
- Error: retry

---

## 4) Approvals (Providers / Locations / Facilities)

> Pattern: each approvals list shares same structure (list → detail → approve/reject).

### 4.1 Pending Providers List
**Route:** `/approvals/providers`  
**Purpose:** review provider KYC submissions

**RBAC**
- View: `approvals.providers.view`
- Approve: `approvals.providers.approve`
- Reject: `approvals.providers.reject`

**UI Components**
- Filters row:
  - Status: Pending / Approved / Rejected
  - Active: Active / Inactive
  - Date range (optional)
- Search: provider name, email, CNIC, business name
- Table columns:
  - Provider name
  - Business name
  - Email
  - Phone
  - CNIC number
  - Status badge
  - Created date
  - Actions: View

**Row Actions**
- View → Provider Approval Detail

**States**
- Loading / empty / error

---

### 4.2 Provider Approval Detail
**Route:** `/approvals/providers/:providerId`  
**Purpose:** inspect provider KYC and decide

**RBAC**
- Same as list for actions

**UI Components**
1) Provider Profile Section
- Avatar
- Provider name
- Business name
- Email / Phone
- Status badge (Pending/Approved/Rejected)
- Account status (Active/Inactive)

2) KYC Section
- CNIC number
- CNIC expiry
- CNIC front image (click to zoom)
- CNIC back image (click to zoom)

3) Decision Panel (only if Pending)
- Textarea: reason/notes (required for Reject; optional for Approve)
- Buttons:
  - **Approve** (permission-gated)
  - **Reject** (permission-gated)

4) Audit Log Panel (read-only)
- Shows previous actions (submitted, reviewed, approved/rejected) if API supports

**Dialogs**
- Approve confirm dialog: “Approve this provider?”
- Reject confirm dialog: requires reason

**Actions**
- Approve → success toast → status becomes Approved
- Reject → success toast → status becomes Rejected
- Back to list retains filters

**States**
- Loading detail
- Error: retry

---

### 4.3 Locations Approval List
**Route:** `/approvals/locations`  
**Purpose:** approve/reject locations (venue papers)

**RBAC**
- `approvals.locations.view/approve/reject`

**UI Components**
- Filters: status, active/inactive, city/area (optional)
- Search: location name, provider name, address
- Table columns:
  - Location name
  - Provider name
  - Area/address short
  - Papers count indicator
  - Status badge
  - Actions: View

**Actions**
- View → Location Approval Detail

---

### 4.4 Location Approval Detail
**Route:** `/approvals/locations/:locationId`

**RBAC**
- same as list for actions

**UI Components**
1) Location Summary
- Cover image + gallery
- Name
- Provider name (clickable → provider detail)
- Address (with map link)
- Status badge

2) Papers Section
- List of uploaded documents/images (preview/download)

3) Decision Panel (if pending)
- Notes/reason textarea
- Approve / Reject buttons

4) Audit Log Panel

**Dialogs**
- Approve confirm
- Reject confirm (reason required)

---

### 4.5 Facilities Approval List
**Route:** `/approvals/facilities`

**RBAC**
- `approvals.facilities.view/approve/reject`

**UI Components**
- Filters: status, active, sport type, city/area (optional)
- Search: facility name, location, provider
- Table columns:
  - Facility name
  - Location name
  - Provider name
  - Sport type
  - Status badge
  - Actions: View

---

### 4.6 Facility Approval Detail
**Route:** `/approvals/facilities/:facilityId`

**UI Components**
1) Facility Summary
- Images gallery
- Name + sport type + type
- Provider + Location (links)
- Status badge

2) Schedule Overview (read-only)
- Operating hours summary
- Pricing blocks summary (if available)
- Slot duration note: fixed 60 mins

3) Decision Panel (if pending)
- Notes/reason
- Approve / Reject

4) Audit log

---

## 5) Bookings Oversight

### 5.1 Bookings List
**Route:** `/bookings`  
**Purpose:** system-wide booking management (BRD aligned)

**RBAC**
- View: `bookings.view`

**UI Components**
- Filters row:
  - Status: Confirmed / In Progress / Completed / Cancelled
  - Payment status: Paid / Pending / Failed / Refunded
  - Type: Online / Walk-in
  - Date range
  - City/Location (optional)
- Search:
  - Booking ID
  - Consumer phone/name
  - Provider name
- Table columns:
  - Booking ID
  - Consumer
  - Provider
  - Location / Facility
  - Date + time
  - Status badge
  - Payment badge
  - Amount
  - Actions: View

**Row Actions**
- View → Booking Detail

**States**
- Loading / empty / error

---

### 5.2 Booking Detail
**Route:** `/bookings/:bookingId`  
**Purpose:** inspect booking + enforce governance actions

**RBAC**
- View: `bookings.view`
- Force cancel: `bookings.force_cancel`
- (Optional) force complete/adjust time: `bookings.force_complete`, `bookings.adjust_time`

**UI Components**
1) Booking Header
- Booking ID + copy
- Status badge + Payment badge
- Created time

2) Parties
- Consumer card:
  - name, phone, email
  - link to consumer profile page
- Provider card:
  - provider name, email/phone
  - link to provider page

3) Venue Details
- Location name + address
- Facility name + sport type
- Slot: date, start, end, duration

4) Payment Details
- Payment mode (Online/Cash)
- Payment status (Paid/Pending/Failed/Refunded)
- Transaction ID (if online)
- Refund status (if applicable)

5) Amounts
- Price
- Discount/tax (if backend provides)
- Total

6) Actions Panel
- **Force Cancel** button (permission gated)
  - Disabled if already Cancelled/Completed (recommended)
- (Optional) “Link dispute” or “Mark disputed” if implemented

7) Audit Log Panel
- Timeline: created, confirmed, started by, completed by, cancelled by (user id + role), refund decision

**Dialogs**
- Force cancel confirm:
  - shows cancellation policy note
  - reason textarea (required)
- Success toast + status refresh

**States**
- Loading detail
- Error: retry

---

## 6) Disputes & Refund Approvals

### 6.1 Disputes List
**Route:** `/disputes`  
**Purpose:** manage disputes (Active/Closed)

**RBAC**
- View: `disputes.view`

**UI Components**
- Filters:
  - Status: Active / Closed
  - Provider / Location / Facility
  - Date range
- Search:
  - dispute id
  - booking id
  - consumer name/phone
- Table columns:
  - Dispute ID
  - Subject
  - Consumer
  - Related booking ID
  - Status badge
  - Created date
  - Actions: View

**States**
- Loading / empty / error

---

### 6.2 Dispute Detail
**Route:** `/disputes/:disputeId`  
**Purpose:** resolve disputes and decide refund approval if needed

**RBAC**
- View: `disputes.view`
- Respond: `disputes.respond` (optional if you add responses)
- Close: `disputes.close`
- Refund approve/reject: `refunds.approve`, `refunds.reject` (if refund applicable)

**UI Components**
1) Dispute Header
- Dispute ID
- Status badge (Active/Closed)
- Created date

2) Complaint Details
- Subject
- Description
- Attachments list (if exists)

3) Related Booking Card (if linked)
- Booking ID (link to booking detail)
- Facility + slot
- Payment status and refund eligibility hint (derived from backend policy result)

4) Resolution Panel (if Active)
- Resolution type dropdown (optional):
  - Refund approved
  - No refund
  - Warning
  - Reschedule suggested
- Resolution notes textarea (required on close)
- Buttons:
  - **Close Dispute** (permission gated)

5) Refund Decision Panel (only when booking is online-paid and backend flags “refund requested/eligible”)
- Read-only policy banner:
  - “Full refund if cancellation > 6 hours before start time; otherwise no refund.”
- Buttons:
  - **Mark Refund Approved** (permission gated)
  - **Mark Refund Rejected** (permission gated)
- Note: UI does **not execute refund**; backend processes and updates paymentStatus to REFUNDED if approved.

6) Admin Notes / Thread (optional)
- Simple list of admin notes (if API supports)

7) Audit Log Panel
- dispute created, notes added, refund approved/rejected, dispute closed

**Dialogs**
- Approve refund confirm (optional reason)
- Reject refund confirm (reason required)
- Close dispute confirm

**States**
- Loading / error

---

## 7) Accounts & Settlements (Admin)

### 7.1 Settlements List
**Route:** `/accounts/settlements`  
**Purpose:** manage settlement periods and payouts (admin-driven)

**RBAC**
- View: `settlements.view`
- Generate: `settlements.generate`
- Mark paid/failed: `settlements.mark_paid`, `settlements.mark_failed`

**UI Components**
- Filters:
  - Status: Pending / Processing / Paid / Failed
  - Provider
  - Period (month/week)
- Search:
  - provider name
  - period id
- Table columns:
  - Settlement/Period ID
  - Provider
  - Period start–end
  - Gross
  - Commission
  - Subscription
  - Net payable
  - Status badge
  - Actions: View

**Top Actions**
- **Generate settlements** (permission gated)
  - opens modal with:
    - Period start/end
    - Settlement frequency (optional)
    - Confirm

**States**
- Loading / empty / error

---

### 7.2 Settlement Detail
**Route:** `/accounts/settlements/:settlementId`

**RBAC**
- View + mark paid/failed permissions

**UI Components**
1) Summary Header
- Provider card (link to provider)
- Period start–end
- Status badge

2) Totals Breakdown
- Gross
- Commission
- Subscription
- Net payable

3) Bookings Breakdown (must show)
- Table of booking IDs + amounts + commission

4) Actions Panel
- **Mark as Paid** (permission gated)
- **Mark as Failed** (permission gated)
- Download report (optional; can be backend link)

5) Audit Log Panel
- generated by, status changes, paid/failed by

**Dialogs**
- Mark paid confirm
- Mark failed confirm (reason required)

---

### 7.3 Refunds Queue (Optional but recommended page)
**Route:** `/accounts/refunds`  
**Purpose:** view refund requests (even if decisions happen from Disputes or Bookings)

**RBAC**
- `refunds.view`, `refunds.approve`, `refunds.reject`

**UI Components**
- Filters: status (Pending/Approved/Rejected/Processed), date range
- Search: booking id, consumer phone
- Table:
  - Refund request id
  - Booking id
  - Amount
  - Policy eligibility flag
  - Status badge
  - Actions: View

**Actions**
- View → Refund Detail (or open Booking/Dispute detail)

---

## 8) Subscriptions

### 8.1 Subscription Plans List
**Route:** `/subscriptions/plans`  
**Purpose:** CRUD plans (commission/subscription/hybrid)

**RBAC**
- View/manage: `subscriptions.manage_plans`

**UI Components**
- Table columns:
  - Plan name
  - Price
  - Duration
  - Monetization model (commission %, fixed, subscription-only, hybrid)
  - Settlement frequency default
  - Status (Active/Inactive)
  - Actions: View/Edit, Inactivate

**Top Actions**
- **Create Plan** button → Plan Form modal/page

**States**
- Loading / empty / error

---

### 8.2 Create/Edit Plan
**Route:** `/subscriptions/plans/new` and `/subscriptions/plans/:planId/edit`

**UI Components**
- Plan name
- Price
- Duration (days/months)
- Features/limits (locations, facilities, employees) (optional)
- Monetization model selector:
  - Commission %
  - Fixed fee per booking
  - Subscription-only
  - Hybrid
- Settlement frequency dropdown
- Status toggle (Active/Inactive)
- CTA: Save

**Validations**
- Name required
- Price >= 0
- If commission model chosen → percentage required

**States**
- Loading on save
- Error toast

---

### 8.3 Provider Subscriptions List
**Route:** `/subscriptions/providers`  
**Purpose:** view provider subscription status, expired/expiring

**RBAC**
- View/assign: `subscriptions.view`, `subscriptions.assign_plan`

**UI Components**
- Filters:
  - Status: Active / Expired / Expiring soon
  - Plan
- Search: provider name/email
- Table columns:
  - Provider
  - Current plan
  - Valid till date
  - Status badge
  - Actions: View / Assign Plan

**Actions**
- Assign Plan opens modal:
  - select plan
  - start date
  - end date (or duration)
  - note
  - confirm

---

### 8.4 Subscription Requests
**Route:** `/subscriptions/requests`  
**Purpose:** process provider renewal/upgrade requests

**RBAC**
- `subscriptions.process_requests`

**UI Components**
- Filters: status (Pending/Approved/Rejected)
- Table:
  - Request id
  - Provider
  - Requested plan
  - Request type (renew/upgrade)
  - Created date
  - Status badge
  - Actions: View

**Request Detail**
- approve / reject + reason
- on approve: assign plan / extend validity

---

## 9) Notifications (Admin Compose + History)

### 9.1 Compose Notification
**Route:** `/notifications/compose`  
**Purpose:** send broadcast/targeted notifications

**RBAC**
- `notifications.compose`

**UI Components**
1) Audience selector
- All
- Consumers
- Providers
- Employees

2) Filters
- City
- Provider plan
- Active users only

3) Content
- Title (required)
- Message (required)
- Deep link (optional):
  - bookingId, facilityId, locationId, disputeId, url

4) CTA
- Send now
- Schedule send

**States**
- Sending loading
- Success toast + redirect to History

---

### 9.2 Notification History
**Route:** `/notifications/history`  
**Purpose:** list sent notifications

**RBAC**
- `notifications.view_history`

**UI Components**
- Filters: audience, date range
- Search: title text
- Table:
  - Title
  - Audience
  - Created date
  - Sent by (admin)
  - (Optional) delivery stats
  - Actions: View

**Notification Detail**
- Full title/message
- Deep link info
- Audience filters snapshot

---

## 10) Reports

### 10.1 Reports Dashboard
**Route:** `/reports`  
**Purpose:** generate exports (CSV/PDF depending on backend)

**RBAC**
- `reports.view`, `reports.export`

**UI Components**
- Date range picker
- Report type cards:
  - Bookings by city/location/facility
  - Revenue (gross/net), commissions
  - Court utilization
  - Provider performance
  - Disputes volume & resolution time
- Export format selector (CSV/PDF)
- CTA: Generate / Export
- Result area:
  - download link (if synchronous)
  - “Report queued; link will be emailed” (if async)

**States**
- Loading on generate
- Error toast

---

## 11) User Management (Users + Roles)

### 11.1 Users List (All Users)
**Route:** `/users`  
**Purpose:** admin user management for all roles (consumer/provider/employee/admin)

**RBAC**
- `users.view` and actions per permission:
  - edit: `users.edit`
  - deactivate: `users.deactivate`

**UI Components**
- Filters:
  - Role: Consumer / Provider / Employee / Admin
  - Status: Active / Inactive
- Search: name, email, phone
- Table:
  - Avatar
  - Name
  - Email/Phone
  - Role
  - Status badge
  - Actions: View, Edit, Deactivate

**States**
- Loading / empty / error

---

### 11.2 User Detail
**Route:** `/users/:userId`

**UI Components**
- Profile info
- Role + status
- Activity snapshot (optional)
- Actions:
  - Edit (permission gated)
  - Deactivate/Activate (permission gated)
- Audit log

---

### 11.3 Edit User
**Route:** `/users/:userId/edit`

**UI Components**
- Name
- Email
- Phone
- Role selector (if allowed)
- Status toggle
- CTA: Save

**Validations**
- Email format
- Phone format

---

### 11.4 Roles List
**Route:** `/roles`  
**Purpose:** RBAC roles and permissions

**RBAC**
- `roles.view`, `roles.manage`

**UI Components**
- Search by role name
- Table:
  - Role name
  - Permissions count
  - Status badge
  - Actions: View/Edit, Inactivate

**Top Actions**
- Create Role

---

### 11.5 Create/Edit Role
**Route:** `/roles/new` and `/roles/:roleId/edit`

**UI Components**
- Role name (required)
- Permissions checklist grouped by feature:
  - Approvals
  - Bookings
  - Disputes/Refunds
  - Accounts/Settlements
  - Subscriptions
  - Notifications
  - Reports
  - Users/Roles
- CTA: Save

**States**
- Loading
- Error toast

---

## 12) Entity Management Pages (Consumers / Providers / Locations / Facilities)

> These are “management lists” separate from approvals queues.

### 12.1 Consumers List
**Route:** `/consumers`  
**RBAC:** `users.view` (or a dedicated `consumers.view` if you split)

**UI Components**
- Search: name/phone/email
- Filters: active/inactive
- Table: consumer info + actions (view/edit/deactivate)

---

### 12.2 Providers List
**Route:** `/providers`  
**RBAC:** `approvals.providers.view` (or dedicated `providers.view`)

**UI Components**
- Search: provider name/email/CNIC/business
- Filters: active/inactive, verified/unverified
- Table: provider info + actions (view/edit/deactivate)

**Provider Detail**
**Route:** `/providers/:providerId`
- Provider profile + KYC summary
- Subscription summary
- Locations list under provider
- Facilities list under provider
- Actions: deactivate, assign plan (permission gated)

---

### 12.3 Locations List
**Route:** `/locations`  
**RBAC:** `approvals.locations.view` (or dedicated)

**UI Components**
- Search + filters
- Table + actions (view/edit/inactivate)

**Location Detail**
**Route:** `/locations/:locationId`
- Images, address, provider link, facilities list
- Status active/inactive toggle (permission gated)
- Audit log

---

### 12.4 Facilities List
**Route:** `/facilities`  
**RBAC:** `approvals.facilities.view` (or dedicated)

**UI Components**
- Search + filters
- Table + actions

**Facility Detail**
**Route:** `/facilities/:facilityId`
- Images, sport type, schedule overview, active/inactive toggle
- Audit log

---

## 13) Admin Profile

### 13.1 Profile
**Route:** `/profile`  
**Purpose:** admin’s own profile & security

**UI Components**
- Tabs:
  1) Profile info (avatar, name, email)
  2) Edit info (form)
  3) Change password
- Save actions with confirmation toasts

**RBAC**
- Any logged-in admin can view

---

## 14) Audit Logging Expectations (Cross-cutting)

The following actions must create an audit log entry (backend) and UI should display it when available:
- Approve/Reject Provider/Location/Facility (with reason)
- Force cancel booking (with reason)
- Deactivate/Activate user/provider/location/facility
- Mark refund approved/rejected (with reason)
- Settlement: generate, mark paid/failed (with reason if failed)
- Role create/edit/deactivate
- Notification compose/send

Audit log row recommended fields:
- action type
- performedBy (admin id + name)
- target entity (type + id)
- timestamp
- reason/notes (if provided)

---

## 15) Screen Inventory (Quick Index)

### Public
- Login (`/login`)
- Forgot Password (`/forgot-password`)
- Reset OTP (`/reset-otp`)
- Reset Password (`/reset-password`)
- Not Authorized (`/not-authorized`)

### Core Admin
- Dashboard (`/`)
- Approvals:
  - Providers (`/approvals/providers`, `/approvals/providers/:providerId`)
  - Locations (`/approvals/locations`, `/approvals/locations/:locationId`)
  - Facilities (`/approvals/facilities`, `/approvals/facilities/:facilityId`)
- Bookings:
  - Bookings list (`/bookings`)
  - Booking detail (`/bookings/:bookingId`)
- Disputes:
  - Disputes list (`/disputes`)
  - Dispute detail (`/disputes/:disputeId`)
- Accounts:
  - Settlements list (`/accounts/settlements`)
  - Settlement detail (`/accounts/settlements/:settlementId`)
  - Refunds queue (optional) (`/accounts/refunds`)
- Subscriptions:
  - Plans (`/subscriptions/plans`)
  - Create/Edit plan (`/subscriptions/plans/new`, `/subscriptions/plans/:planId/edit`)
  - Provider subscriptions (`/subscriptions/providers`)
  - Requests (`/subscriptions/requests`)
- Notifications:
  - Compose (`/notifications/compose`)
  - History (`/notifications/history`)
- Reports (`/reports`)
- Users (`/users`, `/users/:userId`, `/users/:userId/edit`)
- Roles (`/roles`, `/roles/new`, `/roles/:roleId/edit`)
- Entity management:
  - Consumers (`/consumers`)
  - Providers (`/providers`, `/providers/:providerId`)
  - Locations (`/locations`, `/locations/:locationId`)
  - Facilities (`/facilities`, `/facilities/:facilityId`)
- Profile (`/profile`)