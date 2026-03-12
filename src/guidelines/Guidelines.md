# BKT Advisory Main Site - Development Guidelines (v2.0)

This document serves as the **source of truth** for maintaining the site's modern aesthetic, portfolio content, marketing UI, and standard routing. 

## 1. Context Engineering: Project Identity & Boundaries
- **Project Name:** BKT Advisory Marketing Platform
- **Core Focus:** UI/UX, static content, and standard portfolio routing.
- **STRICT BOUNDARY:** This repository strictly handles the front-end marketing site. It does NOT handle the Project Estimator's complex state logic, PDF/DOCX generation, or Salesforce infrastructure mapping. 
- **Backend Routing:** If this UI interacts with the Supabase backend (e.g., for the global AI Chatbot), the endpoint prefix is STRICTLY `/make-server-07a007e1` (Do NOT use the deprecated `defb8dbd` route).

## 2. Agentic Validation: Self-Validation Protocol
Before concluding a task or asking for human review on a visual change, you MUST self-validate:
1. **Terminal Check:** Verify that there are no build errors or terminal crashes in Vite.
2. **Visual Specs:** Visually verify padding, margins, and typography against Figma specifications. Specifically check that the Hero gradients (`from-[#0F172B] via-slate-800 to-blue-950`) render correctly.
3. **Responsive Check:** Ensure sticky navigation (`sticky top-0 z-50`) does not overlap or obscure content on mobile viewports.
4. **Third-Party Scripts:** Verify the Google Calendar Appointment Scheduler scripts in `ScheduleCallButton` load without CORS errors.

## 3. Tech Stack & UI Standards
**Core Tech Stack:**
- React (with TypeScript) + Vite
- Tailwind CSS v4.0
- Shadcn UI Components
- **STRICT ICON RULE:** Do NOT import or use `lucide-react`. All icons must be built as inline SVG components to prevent bundling/import issues.

**Visual Theme & Typography:**
- "Tech-forward" aesthetic using deep navys (`#0F172B`), slate-800 gradients, and clean typography.
- Primary Headings: `Slate-50` on dark backgrounds. Accents: `Blue-600` to `Indigo-600`.
- Do NOT override default typography settings in `/styles/globals.css` unless specifically requested.
- Use subtle entrance animations (fade-in, slide-up). Avoid aggressive motion.

## 4. Agentic Codebases: Component Architecture
### Navigation (`/components/Navigation.tsx`)
- **Behavior:** Implements sticky scrolling (`sticky top-0 z-50`).
- **Assets:** Ensure conditional rendering for logos uses the correct Figma asset hashes (e.g., Shield logo for mobile, Full logo for desktop).

### ScheduleCallButton (`/components/ScheduleCallButton.tsx`)
- **Usage:** Shared component used by all CTA buttons ("Schedule Strategy Call").
- **Configuration:** Integrates with Google Calendar Appointment Scheduler.
- **Validation:** Always ensure `window.calendar.schedulingButton.load()` is updated if the booking URL changes.

### Global AI Chatbot (`/components/AIChatbot.tsx` - UI Shell)
- **Behavior:** Persistent floating component accessible site-wide.
- **Architecture:** Powered by standard OpenAI `gpt-4` chat completions via Supabase (NOT the o1 Responses API). 
- **Integration:** Detects hidden `:::OPEN_BOOKING:::` tags in the AI response to render inline Google Meet scheduling cards. Ensure the JSON parsing logic is safely scoped in try/catch blocks to prevent temporal dead-zone crashes.

## 5. Compound Engineering
- If you successfully execute a complex UI sync from Figma (e.g., matching the exact `-mt-[2px]` padding adjustments on booking cards), document the Tailwind class combinations used. Propose adding this as a custom snippet or rule to automate the layout flow for future design updates.