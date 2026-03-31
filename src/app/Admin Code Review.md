# TripTribe — Admin Code Review

## 1. Project Overview

**TripTribe** is a Next.js 14 (App Router) travel-platform admin portal.  
It is a fully client-side rendered dashboard (`"use client"`) backed by a REST API.  
Auth is handled with JWT tokens stored in cookies (`js-cookie`). All config comes from env vars:

| Env Var                   | Usage     |
| ------------------------- | --------- |
| `NEXT_PUBLIC_BASE_URL`    | API host  |
| `NEXT_PUBLIC_API_VERSION` | e.g. `v1` |

---

## 2. Route Map

```
/                      → Public home page (src/app/(public)/page.jsx)
/login                 → Auth page
/admin/dashboard       → KPI overview
/admin/operators       → List, filter, add, update, delete operators
/admin/operators/[id]  → (exists in FS but not yet confirmed with source)
/admin/operators/edit/[id] → Edit operator form
/admin/trips           → List, filter, add, delete, status-change trips
/admin/trips/[id]      → Trip detail view
/admin/trips/edit/[id] → Edit trip form
/admin/enquiries       → List, filter, close, delete enquiries
/admin/enquiries/[id]  → Enquiry detail + admin notes + status update
/admin/settings        → Destinations & Categories management
/admin/audit-logs      → Read-only audit log viewer
```

---

## 3. Architecture: Admin Section

### 3.1 Layout (`admin/layout.jsx` + `AdminLayoutClient.jsx`)

- The layout wraps everything in a `<ToastProvider>` and renders a **collapsible sidebar**.
- On mobile (`< 768px`) the sidebar is **force-collapsed** and cannot be expanded (the `toggle` no-ops on mobile).
- `isMounted` guard prevents SSR hydration mismatch (returns `null` before mount).
- Content area uses `ml-16` / `ml-64` margin depending on collapsed state.

### 3.2 Auth Guard (`AdminGuard.jsx`)

- Reads `token` and `user` cookies on mount.
- Redirects to `/` if no token, or to `/dashboard` if role is not `ADMIN`/`SUPER_ADMIN`.
- Uses `setTimeout(..., 0)` to avoid the React "cannot update during render" warning.
- **Note:** `AdminGuard` is _not_ applied in the admin layout itself — it's applied **per page** (wraps the page JSX). This means the sidebar and layout shell still render for a brief flash before the guard redirects.

### 3.3 Sidebar (`AdminSidebar.jsx`)

- Dark gradient sidebar (`slate-900 → slate-800`), teal active state.
- Fetches and displays the logged-in admin's name/email via `GET /auth/profile` on mount.
- Nav links: Dashboard, Operators, Trips, Enquiries, Audit Logs, Settings.
- Logout clears all cookies (`token`, `rememberedEmail`, `rememberMe`, `user`) and pushes to `/`.

---

## 4. Admin Route Deep-Dives

### 4.1 `/admin/dashboard`

**API:** `GET /dashboard`  
**What it shows:**

- 3 stat cards: Total Operators (with status breakdown), Total Trips (by status), Total Enquiries (this week / this month).
- A `recharts` line chart of enquiry trends over the last 6 months.
- Recent activity feed (TRIP_ADDED, NEW_ENQUIRY, OPERATOR_REGISTERED, REVIEW_SUBMITTED).

> [!NOTE]
> Several sections are commented out: "Popular Destinations" bar chart and "Top 5 Destinations" table — apparently designed but not wired.

---

### 4.2 `/admin/trips`

**File size:** 1868 lines (very large — mostly the `AddTripModal`)  
**APIs used:**

- `GET /trips/admin` — paginated list with filters
- `GET /operators/admin?application_status=APPROVED` — populate operator dropdown
- `PUT /trips/admin/:id` — status change (DRAFT→PUBLISHED, PUBLISHED→ARCHIVED, ARCHIVED→DRAFT)
- `DELETE /trips/admin/:id` — only allowed when status is CANCELLED

**Filters:** Search (debounced, 500ms, min 2 chars), Operator, Status, Trip Type, Difficulty, Sort By  
**Columns:** Trip image+name, Operator, Price (₹), Start Date, Difficulty (color-coded), Status badge, Actions dropdown

**Trip status state machine (via inline dropdown):**

```
DRAFT → PUBLISHED (Activate)
PUBLISHED → ARCHIVED (Archive)
ARCHIVED → DRAFT (Draft)
CANCELLED → DELETE
```

**`AddTripModal`** (inline in the same file):

- Large form with: name, description, price, seats, dates, source/destination locations, difficulty, trip type, images.
- Uses a dynamically-imported `MapPickerTrip` (Leaflet, SSR disabled).
- Image upload to an API endpoint.
- Itinerary builder (add/remove days and activities).
- Inclusions / Exclusions list builder.

---

### 4.3 `/admin/trips/[id]`

**API:** `GET /trips/admin/:id` + parallel fetches for operator, source location, destination location  
**Shows:** Hero image carousel, trip metadata (price, difficulty, dates, operator, route), gallery grid, itinerary day-by-day, inclusions/exclusions.

---

### 4.4 `/admin/trips/edit/[id]`

Directory exists, has a nested `[id]` sub-directory (not read in this review, but the operators page links to `/admin/trips/edit/${trip.id}`).

---

### 4.5 `/admin/operators`

**File size:** 1460 lines  
**APIs used:**

- `GET /operators/admin` — paginated with filters
- `PUT /operators/admin/:id` — approve/reject/activate/inactivate/suspend
- `DELETE /operators/admin/:id`

**Filters:** Search (debounced), Status (active/inactive/suspended), Source (admin_created/application), Sort By  
**Operator status state machine:**

```
PENDING   → APPROVED or REJECTED
APPROVED + ACTIVE → Edit, Inactivate, Suspend
APPROVED + INACTIVE → Activate, Delete
APPROVED + SUSPENDED → Activate
REJECTED → Approve, Delete
```

**Responsive:** Has both a **desktop table** (hidden on mobile) and a **mobile card** layout.  
**`AddOperatorModal`** is inline in the same file.

---

### 4.6 `/admin/operators/[id]`

Exists as a directory with a `page.jsx` (not read in detail; linked from operator list "View Details").

---

### 4.7 `/admin/enquiries`

**APIs used:**

- `GET /enquiries/admin` — paginated list
- `PUT /enquiries/admin/:id` — mark as CLOSED
- `DELETE /enquiries/admin/:id`

**Filters:** Search, Status (new/in_progress/closed), Enquiry Type (GENERAL/TRIP/PARTNERSHIP/SUPPORT/FEEDBACK), From Date, To Date  
**Columns:** Name + phone, Enquiry Type (color badge), Email, Date, Status badge, Actions

> [!NOTE]
> `enquiries/page.jsx` does **not** use `<AdminGuard>`. It manually checks for the token and calls `router.push("/")` if missing. This is inconsistent with other pages.

---

### 4.8 `/admin/enquiries/[id]`

- Shows full enquiry details: traveller info, enquiry type, message/subject.
- If type is `TRIP`, shows a linked trip card.
- Admin can update **status** (new/in_progress/closed) and add **admin notes**.
- Saves via `PUT /enquiries/admin/:id`.

---

### 4.9 `/admin/settings`

Two tabs: **Destinations** and **Categories**

**Destinations:**

- `GET /locations/admin` (paginated, region filter)
- `POST /locations/admin` — add destination via modal with map picker
- `DELETE /locations/admin/:id` — gracefully handles "trips exist" validation error

**Add Destination Modal:**

- Uses Nominatim (OpenStreetMap) for geosearch (India only, `countrycodes=in`).
- Dynamically imported Leaflet `MapPicker` component.
- Saves name, region, type (from `/locations/types/all`), lat/lng.

**Categories (Trip Types):**

- Manages trip type categories used in trip filtering.
- (Implementation is in the same file, lines 800+)

---

### 4.10 `/admin/audit-logs`

**API:** `GET /audit` — paginated  
**Filters:** Search (actor/entity text), Entity Type (trip/user/operator/location/enquiry), From Date, To Date  
**Columns:** Action (color badge), Entity (color badge), Date, Old Values (JSON tooltip), New Values (JSON tooltip), Actor name+email  
**Note:** Action filter is built but commented-out in the UI.

---

## 5. Shared Utilities & Hooks

| File                            | Purpose                                           |
| ------------------------------- | ------------------------------------------------- |
| `hooks/use-toast.js`            | Toast notification hook (used everywhere)         |
| `hooks/use-triptypes.js`        | Fetches trip types from API, used in trips filter |
| `hooks/use-mobile.js`           | Mobile breakpoint hook                            |
| `components/AdminGuard.jsx`     | Auth + role gate                                  |
| `components/AdminSidebar.jsx`   | Nav sidebar                                       |
| `components/admin/StatusBadge`  | Colored status pill                               |
| `components/admin/StatCard`     | Dashboard KPI card                                |
| `components/admin/ActivityFeed` | Dashboard activity list                           |
| `components/MapPicker.jsx`      | Leaflet map (for destinations)                    |
| `components/MapPickerTrip.jsx`  | Leaflet map (for trips, with source/dest marker)  |

---

## 6. Bugs & Issues Found

### 🔴 Critical

1. **`AdminGuard` is applied per-page, not in the layout.**  
   The sidebar and layout frame render for non-admins before redirect fires. Should be moved to `AdminLayoutClient`.

2. **`handleUpdateOperator` doesn't `return` on error.**  
   In `operators/page.jsx` L237–243, when `!res.ok || !data.success` the error toast fires but execution continues to the success toast on L245. A `return` is missing after the destructive toast.

3. **Audit Logs — `End Date` onChange sets `fromDate` instead of `toDate`.**  
   `audit-logs/page.jsx` L331: `setFromDate(e.target.value)` should be `setToDate(e.target.value)`. The end-date filter is broken.

4. **Duplicate params appended in Audit Logs fetch.**  
   `audit-logs/page.jsx` L74–97: `search` and `actionFilter` are appended to `params` twice (L74+L90, L77+L93). The URL will contain these params doubled.

### 🟡 Warnings

5. **`enquiries/page.jsx` missing `<AdminGuard>`.**  
   It does a manual token check but misses role validation — a non-admin user with a valid token can access this page.

6. **`getAllTrips` in `trips/page.jsx` includes `initialLoading` in `useCallback` deps** (L196).  
   This causes the callback to refresh its reference every time `initialLoading` changes, which is once per load — mostly harmless but semantically wrong.

7. **`window.confirm()` for destructive actions.**  
   Both trips and operators use `window.confirm()` for delete confirmation. This is a poor UX pattern and blocks the browser. A modal confirmation dialog is recommended.

8. **Operator `edit` link commented out in the list dropdown.**  
   The Edit link is commented out for most operator states; it only appears for `APPROVED + ACTIVE`. The route `/admin/operators/edit/[id]` exists but is largely inaccessible.

9. **Trip status action uses `UserX` icon for all status transitions.**  
   "Activate", "Archive", and "Draft" all use the `UserX` icon, which is semantically wrong.

### 🟢 Minor

10. **`inquiries` vs `enquiries` typo in API param.**  
    The enquiry filter sends `inquiry_type` (US spelling) to the API while the UI labels say "Enquiry Type". This is fine if the API expects it but worth noting.

11. **Settings Destinations table has an incomplete column grid.**  
    The grid is `grid-cols-[2.5fr_2fr_2fr_2fr_1fr]` (5 cols) but only 4 data columns render (Destination, Region, Type, Actions). The 4th `2fr` column slot is empty.

12. **`AddTripModal` and `AddOperatorModal` are collocated in the same file as the list page.**  
    These are very large components (~800+ lines each). They should be extracted into separate files.
