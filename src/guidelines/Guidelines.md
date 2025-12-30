# BKT Advisory - Development Guidelines

This document serves as the **source of truth** for maintaining the site's modern aesthetic and complex functionality, including the AI Assistant and Project Estimator.

---

## 1. Project Overview

**Name:** BKT Advisory Marketing & Estimation Platform

**Goal:** A tech-forward marketing site integrated with a complex lead-generation tool (Tech Project Estimator) and an AI Assistant powered by OpenAI.

**Core Tech Stack:**
- React (with TypeScript)
- Tailwind CSS v4.0
- Shadcn UI Components
- Lucide React (Icons)
- OpenAI Responses API (model o1)
- Supabase Backend (Edge Functions, Auth, Storage)

---

## 2. Design System & UI Standards

### Visual Theme
"Tech-forward" aesthetic using deep gradients (Blue/Indigo), glassmorphism effects, and clean typography.

### Color Palette
- **Primary:** Slate-900 (Dark backgrounds), Blue-600 to Indigo-600 (Gradients/Accents)
- **Text:** Slate-50 for headings on dark backgrounds, Slate-300 for body text
- **Accents:** Blue-500, Indigo-500 for interactive elements

### Typography
- **Important:** Do NOT override default typography settings in `/styles/globals.css` unless specifically requested
- The project has default font sizes, weights, and line-heights configured for each HTML element
- Only apply Tailwind typography classes (`text-2xl`, `font-bold`, `leading-none`) when explicitly needed

### Print Styles
**Crucial:** The site uses specific CSS overrides for printing. All dark backgrounds are forced to white and text to black during PDF generation (`window.print()`).

### Animations
- Use subtle entrance animations (fade-in, slide-up) for sections
- Avoid aggressive motion that distracts from content
- Prefer smooth transitions over jarring effects

### Component Styling Override
Some base Shadcn UI components have default styling (gap, typography) baked in. **Always explicitly set styling information** from these guidelines in generated React components to override the defaults.

---

## 3. Component Architecture

### BookingModal (`/components/BookingModal.tsx`)
- **Usage:** Shared component used by all CTA buttons ("Book Strategy Call," "Let's Talk," "Schedule a Call")
- **Configuration:** Wraps the Calendly iframe
- **Maintenance:** Update the Calendly URL here to reflect changes across the entire site instantly
- **Important:** "Schedule a Call" prompts should equate to the same functionality as "Book a Strategy Call"

### AI Chatbot (`/components/AIChatbot.tsx`)
- **Behavior:** Persistent floating component accessible site-wide
- **Backend:** Powered by OpenAI Responses API (model o1) with Supabase backend
- **Route Detection:** Detects current page route to customize greetings
- **Estimator Integration:** Contains specific logic to read user intent and generate structured prompts for the Estimator form
- **State Architecture:** Communicates with lifted state in `App.tsx` for real-time form updates

#### UI Behaviors
- **Scrolling:**
  - Independent message scrolling with "hidden-until-hover" scrollbar on desktop
  - Momentum scrolling on mobile
- **Chat Input:**
  - Dynamic textarea that expands up to 4 lines
  - Auto-adjusts height based on content
- **Quick Prompts:**
  - Context-aware prompts based on current page
  - Special prompts for Project Estimator (visible from Step 2+)

#### AI Toolbar Integration
- **Location:** Embedded within Project Estimator's "Project Description" textarea
- **Modes:**
  - **"Generate from Selections"**: Creates project description from selected checkboxes
  - **"Autofill Configuration"**: Parses free-form text to automatically update checkboxes across Steps 2-3
- **Default Behavior:** Defaults to "Nearshore" team configuration when autofilling

### Estimator Tool (`/components/Estimator.tsx`)
- **State Management:** Multi-step form wizard with state lifted to `App.tsx`
- **Data Persistence:** State persists until submission or page refresh
- **PDF Generation:** **Do NOT use html2canvas**. The system relies on native browser printing (`window.print()`) with a dedicated `@media print` CSS block to generate clean quotes
- **AI Integration:**
  - Quick Prompts within Chat Interface (Step 2+ only)
  - Embedded AI Toolbar in "Project Description" field
  - Intelligent autofill that updates checkboxes based on natural language input

#### Lifted State Architecture
- Estimator state is managed in `App.tsx`, NOT within the component itself
- Enables real-time communication between AI Chatbot and form configuration
- AI can read current selections and modify form state directly
- Maintains synchronization between user manual input and AI-driven changes

---

## 4. Development & Contribution

### Adding New Pages
1. Create the component in `/components/` (pages are components in this architecture)
2. Add the route in `App.tsx`
3. Update `Navigation.tsx` (ensure mobile menu is also updated)
4. Consider adding context-aware AI prompts for the new page

### Modifying the Estimator
- When adding new tech stack options, update:
  1. Selection UI in the appropriate step
  2. Cost calculation logic to ensure quotes remain accurate
  3. AI parsing logic to recognize new options in autofill mode
- Maintain consistency with the lifted state pattern in `App.tsx`

### Working with Supabase Backend
- **Server Location:** `/supabase/functions/server/index.tsx`
- **Routes:** All routes must be prefixed with `/make-server-defb8dbd`
- **CORS:** Server responds with open CORS headers
- **Error Handling:** Include detailed error messages with context for debugging
- **Environment Variables:**
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `OPENAI_API_KEY`

### Protected Files
**DO NOT modify these files:**
- `/supabase/functions/server/kv_store.tsx`
- `/utils/supabase/info.tsx`
- `/components/figma/ImageWithFallback.tsx`

---

## 5. Accessibility (A11y) Checklist

### Modals
- Ensure `DialogTitle` and `DialogDescription` are present (even if visually hidden via `sr-only`) for screen readers

### Forms
- All inputs in the Estimator must have associated labels
- Use proper ARIA attributes for multi-step wizards
- Ensure keyboard navigation works throughout the form

### Contrast
- Verify that text over gradient backgrounds maintains a 4.5:1 contrast ratio
- Test with tools like WebAIM Contrast Checker

### Focus Management
- Maintain visible focus indicators on all interactive elements
- Ensure logical tab order through forms and navigation

---

## 6. AI & Estimator Integration Details

### Current Implementation State
✅ Lifted state architecture with Estimator state in `App.tsx`  
✅ Real-time communication between AI Chatbot and form configuration  
✅ Dynamic quick prompts that appear contextually  
✅ Embedded AI toolbar in textarea with alternating modes  
✅ Intelligent autofill parsing free-form text to update checkboxes  
✅ Default "Nearshore" team configuration on autofill  

### Key Technical Requirements
- **OpenAI API:** Uses Responses API with model o1
- **State Sharing:** Estimator state must be accessible to AI Chatbot
- **Context Awareness:** AI prompts change based on:
  - Current page/route
  - Estimator step (if on Estimator page)
  - User's previous selections
- **Autofill Logic:** Must parse natural language and map to specific form checkboxes

---

## 7. Best Practices

### Code Organization
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Use TypeScript for type safety
- Comment complex AI parsing logic

### Performance
- Lazy load routes where appropriate
- Optimize re-renders when working with lifted state
- Debounce AI API calls to avoid excessive requests

### Error Handling
- Provide user-friendly error messages
- Log detailed errors to console for debugging
- Gracefully handle API failures (OpenAI, Supabase)

### Testing Strategy
- Test AI prompt variations manually
- Verify autofill logic with various input formats
- Test print/PDF generation across browsers
- Validate form submission flows end-to-end

---

## 8. Maintenance Notes

### When Updating AI Prompts
- Update in `AIChatbot.tsx`
- Test with Estimator integration
- Verify context-aware prompts still work

### When Modifying Estimator Form
- Update state interface in `App.tsx`
- Update AI parsing logic to recognize new fields
- Test autofill functionality
- Update cost calculations

### When Changing Calendly Integration
- Update URL in `BookingModal.tsx` only
- Changes automatically propagate to all CTA buttons
- Test modal opens correctly from all trigger points

---

## 9. Known Constraints

- Cannot use `html2canvas` for PDF generation (use `window.print()` instead)
- Must prefix all server routes with `/make-server-defb8dbd`
- Cannot write DDL statements or migrations (use KV store for data persistence)
- Supabase Service Role Key must never leak to frontend
- File operations on server limited to `/tmp` directory only

---

**Last Updated:** December 30, 2024  
**Version:** 1.0
