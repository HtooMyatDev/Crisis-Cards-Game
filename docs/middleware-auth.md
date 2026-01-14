# Middleware & Authentication Documentation

## 1. Overview
The `middleware.ts` file acts as the sophisticated gatekeeper for the application. It runs on the Edge runtime (before the request hits the server components) to enforce authentication, role-based access control (RBAC), and environment-specific routing rules.

## 2. Quick Start
The middleware is active automatically for all paths matching `config.matcher`. You don't "call" it; you configure it.

To protect a new route:
1.  Ensure the route starts with `/admin`, `/user`, or `/live`.
2.  Or add the specific path to the `matcher` array in `middleware.ts`.

## 3. Logic Flow & API

The middleware executes the following hierarchy of checks:

1.  **Environment Rewrite**:
    *   If `NEXT_PUBLIC_APP_MODE` is `'live'` and the path is `/` (root), it rewrites the request to `/live`. This allows hosting a "Player Only" version of the app.

2.  **Unauthenticated Access Guard**:
    *   If NO `token` cookie exists:
    *   Blocks access to `/admin/*` and `/user/*`.
    *   Redirects to `/auth/login`.

3.  **Authenticated Redirects (Guest Guard)**:
    *   If `token` cookie EXISTS:
    *   Blocks access to `/auth/*` (Login/Register pages).
    *   Blocks access to `/live/*` (Players in a session shouldn't be wandering, arguably, or this prevents admins from accidentally playing as guests? *Note: Review this logic in your specific context*).
    *   Redirects to the dashboard appropriate for the role (`/admin/dashboard` or `/user/home`).

4.  **Role-Based Access Control (RBAC)**:
    *   Checks the `role` cookie.
    *   **Admin attempting User path**: Redirects to Admin Dashboard.
    *   **User attempting Admin path**: Redirects to User Home.

## 4. Common Patterns

### Adding a Public Route
To allow a page to be public (bypass auth checks), simply ensure it is **NOT** captured by the `matcher` config or the `startsWith` checks.

```typescript
export const config = {
    // Only these paths trigger the middleware
    matcher: ['/admin/:path*', '/auth/:path*', '/user/:path*']
}
```
*Any path not here (e.g., `/about`, `/features`) is public by default.*

### Hybrid Protection
If you need logic inside the middleware, add it before the final `NextResponse.next()`.

```typescript
if (request.nextUrl.pathname === '/secret' && !hasSecretKey) {
    return NextResponse.rewrite(new URL('/404', request.url));
}
```

## 5. Gotchas

*   **Edge Runtime**: Middleware runs in a restricted environment. You cannot use Node.js APIs like `fs` or connect directly to a database with standard drivers. You must use `fetch` or lightweight libraries.
*   **Cookie Dependency**: Security relies entirely on the presence of `token` and `role` cookies. If these are manipulated client-side, the middleware might be tricked (though the backend API should still verify the token signature). *Critical: Ensure cookies are HttpOnly and signed.*
*   **Redirect Loops**: A common bug is redirecting a user to a page that *also* triggers a redirect. The logic explicitly checks `startsWith` to avoid this, but be careful when modifying.

## 6. Related Modules of Interest
*   **`src/app/api/auth`**: The backend routes that set the cookies initially.
*   **`NextRequest` / `NextResponse`**: Next.js server objects.
