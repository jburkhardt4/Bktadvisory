---
applyTo: "**/*.tsx, **/*.ts"
---
# Bktadvisory Workspace Instructions

## Overview
This workspace is a React + TypeScript project using Vite for development and build. It follows strict conventions for routing, authentication, and component structure. See the [README.md][documentationReference]for startup and build commands.

## Build & Test Commands
- Install dependencies: `npm i`
- Start dev server: `npm run dev`
- Run tests: `npm test` (uses Vitest)
- Lint: `npm run lint --if-present`
- Build: `npm run build`

## Key Conventions
- **Routing:** Use React Router hooks (`useNavigate`, `useLocation`, `<Navigate>`) for navigation. Never use `window.location.href` for internal navigation.
- **Deep Linking:** When redirecting unauthenticated users, preserve their intended destination in `location.state.from`.
- **Safe Redirects:** Always validate redirect paths to prevent open redirect vulnerabilities.
- **Session Management:** Use `authSession.ts` utilities for authentication. Do not introduce global state libraries for session.
- **Route Guards:** Use `<RequireAuth>` at route boundaries for protected routes.
- **Component Structure:** Write modular, functional components with modern React hooks. Use strict TypeScript types for all props and state.

## Documentation & References
- [README.md][documentationReference]: Startup, build, and run instructions.
- `.github/instructions/react.instructions.md`: Detailed frontend and routing guidelines.
- `src/guidelines/Guidelines.md`: (If present) Additional project-specific guidelines.

## Link, Don't Embed Principle
When referencing documentation or guidelines, always link to the source file rather than duplicating content. Update this file as conventions evolve.


[documentationReference]: EADME.md)