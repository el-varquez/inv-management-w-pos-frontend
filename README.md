# POS & Inventory Management — Web Admin

The React web admin for a multi-tenant POS and inventory system aimed at small Philippine businesses — sari-sari stores, coffee shops, and similar single-location retail.

Built with **React 19**, **TypeScript**, and **Vite**.

> This is the web client. The ASP.NET Core API lives in [inv-management-w-pos-backend](https://github.com/el-varquez/inv-management-w-pos-backend).

## Screens

| Module | What it does |
|---|---|
| **Auth** | Login, plus self-serve registration that provisions a tenant and its first admin |
| **Items** | Product catalog with categories, search, and a recipe editor for composite items |
| **Inventory** | Add stock, adjust stock, stocktake, low-stock view, movement history |
| **Sales** | POS register for ringing up sales, plus sales history and refunds |
| **Reports** | Sales, Expenses, Profit, and Best Sellers, with searchable category/item filters |
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

### Pagination, deliberately split two ways

Browse lists — Items, stock levels, sales and inventory history — paginate **server-side**, since they grow without bound. Report tables paginate **client-side** through the shared `<Pagination>` component, because a report is a bounded aggregate already fully loaded to render its summary cards. The two are not interchangeable.

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
