# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (Remix + Vite, hot reload)
npm run build        # Production build (remix vite:build)
npm start            # Run production server (remix-serve ./build/server/index.js)
npm run lint         # ESLint with cache
npm run typecheck    # TypeScript type checking (tsc --noEmit)
```

No test framework is configured.

## Architecture

**Remix v2 SPA** with Vite, React 18, Tailwind CSS v4, TypeScript strict mode. Multi-tenant LMS (Learning Management System) frontend.

### Path alias

`~/` maps to `./app/` (configured in tsconfig.json and resolved by vite-tsconfig-paths).

### Route system

Routes are **manually defined** in `vite.config.ts` using `defineRoutes()` — not file-system routing. Each domain area has a `_layout.tsx` parent with nested children. Key route groups: `auth`, `home`, `courses`, `make/courses` (course player), `activities`, `contents`, `assessments`, `forums`, `modules`, `tasks`, `tenants`, `users`, `sections`.

Resource routes (API-only, no UI) live under `routes/api/` for file uploads and signed URLs.

### Provider hierarchy (app/root.tsx)

```
TenantProvider → TenantGuard → AuthProvider → AppSetup → Header + Outlet
```

- **TenantProvider**: resolves tenant from hostname via API call to `/v1/tenants/by-domain`, applies tenant CSS variables
- **TenantGuard**: blocks rendering until tenant is validated
- **AuthProvider**: useReducer-based auth state, JWT tokens stored in cookies (`auth_tokens`, `auth_user`), auto-refresh every 50 min
- **AppSetup**: sets up axios token auto-refresh interceptor

### API layer (`app/api/`)

- **client.ts**: axios factory (`createApiClient(domain, cookies)` and `createApiClientFromRequest(request)`) — adds `X-Tenant-Domain` header and `Authorization: Bearer` from cookies automatically
- **config.ts**: centralized endpoint paths under `API_CONFIG.ENDPOINTS`
- **endpoints/**: one file per domain (auth, courses, contents, etc.), each exports a static API class (e.g., `AuthAPI.login()`, `CoursesAPI.getAll()`)
- **types/**: TypeScript interfaces per domain
- **hooks/**: `useFormValidation` (generic form hook), `useStripeProducts`
- **interceptors/authInterceptor.ts**: axios response interceptor for 401 → auto token refresh

### Server vs client data flow

Route `loader` functions run server-side and call the backend API using `createApiClientFromRequest(request)` (passes cookies from the HTTP request). Client-side API calls use the default `apiClient` singleton which reads cookies from `document.cookie`.

### Auth guards

- **AuthGuard** (`app/components/AuthGuard.tsx`): wraps protected routes, redirects to `/auth/login?returnUrl=...` if unauthenticated
- **RoleGuard**: restricts by user role array
- Both are used inside route components, not at the layout level

### Multi-tenant

The backend identifies the tenant from the `X-Tenant-Domain` header. The frontend reads `window.location.hostname` (client) or `request.url` hostname (server loader) and passes it to every API call. Tenant config includes CSS theme colors applied as CSS custom properties.

### Key conventions

- **Language**: UI text and comments are in Spanish
- **Styling**: Tailwind CSS v4 utility classes, inline critical CSS in root to prevent FOUC
- **Icons**: lucide-react
- **Forms**: server actions via Remix `action` functions + `useFormValidation` hook for client validation
- **Error handling**: root `ErrorBoundary` renders full HTML document for critical errors (5xx), uses layout for non-critical (4xx)
- **File uploads**: handled via resource routes that proxy to CDN backend, content types configured in `app/config/contentTypes.config.ts`
