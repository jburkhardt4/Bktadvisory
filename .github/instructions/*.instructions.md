---
applyTo: "**/*.tsx, **/*.ts"
---

# Bktadvisory Frontend & Routing Guidelines

## Routing & Navigation (React Router)
* **Always use React Router hooks:** Use `useNavigate`, `useLocation`, and `<Navigate>` for internal routing. Never use `window.location.href` unless redirecting to an external site or a standalone app (like `/estimator`).
* **Preserve Intent (Deep Linking):** When redirecting unauthenticated users to `/auth`, always capture their full intended destination (`pathname`, `search` query parameters, and `hash` fragments) in `location.state.from`.
* **Safe Redirects:** When returning a user to their intended destination post-authentication, always validate the path to prevent Open Redirect vulnerabilities. Ensure the redirect resolves to the current origin before navigating.

## State & Authentication
* **Session Management:** Rely on the existing `authSession.ts` utilities (`setSession`, `clearSession`, `isAuthenticated`) for authentication checks. Do not introduce global state libraries (like Redux or Zustand) for session management unless explicitly required.
* **Route Guards:** Protect private routes at the boundary using the `<RequireAuth>` wrapper rather than checking auth state inside individual page components.

## General React Best Practices
* Write functional components using modern React hooks.
* Keep components modular and focused on a single responsibility.
* Use TypeScript strictly: define interfaces/types for all component props and state. Avoid using `any`.
