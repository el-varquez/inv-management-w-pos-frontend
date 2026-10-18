# POS & Inventory Management — Web Admin

The React web admin for a multi-tenant POS and inventory system aimed at small Philippine businesses — sari-sari stores, coffee shops, and similar single-location retail.

Built with **React 19**, **TypeScript**, and **Vite**.

> This is the web client. The ASP.NET Core API lives in [inv-management-w-pos-backend](https://github.com/el-varquez/inv-management-w-pos-backend).

## Screens

| Module | What it does |
|---|---|
| **Auth** | Login, plus self-serve registration that provisions a tenant and its first admin |
| **Items** | Product catalog with categories, search by name, code or barcode, and a recipe editor whose component picker searches the catalog as you type |
| **Inventory** | Add stock, adjust stock, stocktake, low-stock view, valuation and movement history — every list paged and searchable by name, code or barcode |
| **Sales** | POS register for ringing up sales, plus sales history and refunds |
| **Reports** | Sales, Expenses, Profit, and Best Sellers, each paged with totals computed by the API; the Profit item filter is a typeahead narrowed by the chosen category |
| **Cashiers** | Create, deactivate, reactivate, and reset passwords for cashier accounts |
| **Profile** | Admin self-service — display name and password change |
| **Platform** | `SuperAdmin` console — tenant list and detail, onboarding, suspend/reactivate, in-place user management |

Routes are gated two ways: `ProtectedRoute` for authentication and `RoleRoute` for role, which is what keeps `/platform` restricted to `SuperAdmin`.

## Architecture

```
src/
├── features/     one folder per module — auth, items, inventory, sales,
│                 reports, cashiers, profile, platform
├── components/   shared UI — Layout, Modal, Pagination, SearchSelect,
│                 ProtectedRoute, RoleRoute
├── services/     api.ts (Axios instance + interceptors), apiError.ts
├── store/        authStore.ts — Zustand auth state
├── lib/          format + pagination helpers
└── types/        shared TypeScript types
```

**`services/api.ts`** is the single Axios instance. A request interceptor attaches the bearer token from `authStore`; a response interceptor logs the user out on `401`. `apiError.ts` unwraps the API's `{ error: string }` body into a message via `getApiErrorMessage(err, fallback)`.

### Pagination and search

Every list pages **server-side** through the shared `usePagedQuery` hook (`src/hooks/usePagedQuery.ts`): 20 rows per request, plus a per-visit page cache keyed by filters, page and page size. The cache is cleared on `refetch()` (every mutation already calls it), when the filter key changes and when the screen unmounts, so a revisited page renders with no request while a fresh mutation never shows a stale row. Editable pages opt out: the stocktake lines pass `cache: false` and autosave the current page's edits before a page change or a search change.

Reports (Sales, Expenses, Profit, Best sellers) page their rows the same way while their stat cards read totals the API computes over the whole range, so a card never depends on which page is loaded. The utang ledger is a header (balance, amount paid, markup earned, reminders) plus paged entries, newest first, each carrying the running balance the API computed over the full chronological ledger. The business-day list pages through its own hook.

Search is one optional `search` query parameter on every items and inventory list, applied by the API as an exact barcode or a case-insensitive match on name or item code. Each screen's filter bar has a Search field debounced through `useDebouncedValue` and fed into the hook's key, so typing resets to page 1 and clearing returns to the cached page. `ItemSearchSelect` (`features/items/components`) replaces the dropdowns that used to load the whole catalog: it queries `/items/search` as you type, optionally within one category.

**Tech:** React 19 · TypeScript · Vite · React Router 7 · Zustand · Axios · lucide-react

## Getting started

### Prerequisites

- Node.js 20+
- The [backend API](https://github.com/el-varquez/inv-management-w-pos-backend) running locally

### Run locally

```bash
git clone https://github.com/el-varquez/inv-management-w-pos-frontend.git
cd inv-management-w-pos-frontend

npm install
npm run dev
```

Vite serves on `http://localhost:5173`, which must stay in the API's CORS allowlist.

### Scripts

| Command | Does |
|---|---|
| `npm run dev` | Vite dev server on port 5173 |
| `npm run build` | `tsc -b && vite build` |
| `npm run lint` | ESLint across the project |
| `npm run preview` | Serve the production build locally |

### Configuration

| Variable | Default | Notes |
|---|---|---|
| `VITE_API_URL` | `http://localhost:5103/api` | Base URL of the backend API |

Vite bakes `VITE_`-prefixed variables into the client bundle at build time, so they ship to the browser — never put a secret in one. For production, set `VITE_API_URL` through your host's build-time environment variables.

## Roadmap

- **Done** — auth, items, inventory, sales, reports, cashiers, profile, platform console
- **In progress** — tenant subscription and billing UI
- **Next** — Flutter mobile POS, offline-first; all management features stay web-only

## License

Not currently licensed for reuse.
