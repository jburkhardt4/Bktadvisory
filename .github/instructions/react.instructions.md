---
applyTo: "**/*.tsx, **/*.ts"
---
# Bktadvisory Frontend & Routing Guidelines

## Routing & Navigation (React Router)
* **Always use React Router hooks:** Use `useNavigate`, `useLocation`, and `<Navigate>` for internal routing. Never use `window.location.href`.
* **Preserve Intent (Deep Linking):** When redirecting unauthenticated users to `/auth`, always capture their full intended destination (`pathname`, `search`, and `hash`) in `location.state.from`.
* **Safe Redirects:** When returning a user to their intended destination post-authentication, always validate the path to prevent Open Redirect vulnerabilities.

## State & Authentication
* **Session Management:** Rely on `authSession.ts` (`setSession`, `clearSession`, `isAuthenticated`). Do not introduce global state libraries.
* **Route Guards:** Protect private routes at the boundary using the `<RequireAuth>` wrapper.
