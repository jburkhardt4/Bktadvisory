Bktadvisoryprojectestimator - GUIDELINES.md

# BKT Advisory Project Estimator - Development Guidelines (v1.2)

This document is the **source of truth** for maintaining the complex state logic, AI workflows, and document generation architecture of the Project Estimator tool.

## 1. Context Engineering: Project Identity & Boundaries
- **Project Name:** BKT Advisory Tech Project Estimator
- **Core Focus:** Complex state management, AI scope refinement, dynamic quoting logic, and document generation (PDF/DOCX).
- **Architecture:** Single-page conditional rendering. Do NOT attempt to implement `react-router-dom`. The app switches between the Estimator and Quote views via the `showQuote` state in `App.tsx`.
- **STRICT BOUNDARY:** Do not edit basic marketing copy or portfolio components here; those belong to the main BKT Advisory site.

## 2. Agentic Validation: Self-Validation Protocol
- When modifying AI endpoints, you MUST verify the route prefix is strictly `/make-server-07a007e1`. 
- When modifying quote calculations, verify that `adjustedHours` and `estimatedWeeks` remain mathematically consistent across both `Estimator.tsx` and `Quote.tsx`.
- When modifying the Chatbot, ensure `isCalendarBooking` and JSON parsing logic are safely scoped in try/catch blocks to prevent temporal dead-zone crashes.
- Ensure Supabase Edge Functions include appropriate CORS headers (`origin: "*"`) but gracefully handle `429 Too Many Requests` quota limits on the client side.

## 3. Tech Stack & Dependencies Inventory
- **Frontend:** React + TypeScript + Tailwind CSS v4.0
- **Icons:** Inline SVGs ONLY (Do not import `lucide-react`).
- **State/Animations:** Lifted state in `App.tsx`, `motion/react` for stepper carousels.
- **Backend/DB:** `@supabase/supabase-js` (Singleton pattern in `createClient()`).
- **AI Integration:** OpenAI `gpt-4` (Chatbot) and `gpt-4o` (Scope Refiner). Note: Do NOT use the deprecated Responses API.
- **PDF Generation:** `html-to-image` + `jsPDF`. (Print media queries in `globals.css` act as a fallback).
- **DOCX Handling:** `mammoth` (parsing uploads), `docx`, `docxtemplater`, `pizzip` (generating quotes).

## 4. AI Architecture & Endpoints
- **Chatbot (`/chat`):** Uses `gpt-4`. Handles user intent, configuration autofill (CRMs, Clouds, Integrations), and detects hidden `:::OPEN_BOOKING:::` tags to render Google Meet scheduling cards.
- **Scope Refiner (`/refine-scope`):** Uses `gpt-4o`. Enforces strict BABOK-compliant requirements mapping and SMART goals with strict character limits.
- **Document Analysis (`/analyze-document`):** Extracts text from user uploads (up to 500MB via chunking) to pre-fill estimator state. 

## 5. UI Conventions & Component Architecture
### Navigation & Sticky Headers
- **Global Pattern:** Sticky headers must use `sticky top-0 z-50` with a height of `h-[116px]`. 
- **Quote Header:** Mirrors the Estimator's sticky wrapper, offset below the main nav (`sticky top-[116px] z-40`). 

### Figma Asset Registry
Always use these explicit hashed imports for branding consistency:
- `01ab4ddf...`: Full BKT Advisory logo (Desktop Nav)
- `0e0a1216...`: BKT Shield logo (Mobile Nav / Quote Header)
- `9cffe000...`: John Burkhardt Profile image (Quote)
- `c9b7fbd7...`: Signature image (Quote)

### EstimatorStepper (`/components/EstimatorStepper.tsx`)
- Desktop: Uses horizontal royal blue (`#2563EB`) progress connectors.
- Mobile: Uses a calculated `translateX` carousel logic with gradient masking and scale transformations based on the active step index.
