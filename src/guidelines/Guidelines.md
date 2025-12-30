Based on the implemented features and the project structure visible in your screenshot, your Guidelines.md should serve as the "source of truth" for maintaining the site's modern aesthetic and complex functionality (like the AI and Estimator).

Since you currently have an empty file, here is a recommended structure and content to populate your Guidelines.md. You can copy this directly or tweak it to fit your specific workflow.

Recommended Content for Guidelines.md
1. Project Overview
Name: BKT Advisory Marketing & Estimation Platform

Goal: A tech-forward marketing site integrated with a complex lead-generation tool (Tech Project Estimator) and an AI Assistant.

Core Tech Stack: React, TypeScript, Tailwind CSS, Shadcn UI, Lucide React (Icons).

2. Design System & UI Standards
Visual Theme: "Tech-forward" aesthetic using deep gradients (Blue/Indigo), glassmorphism effects, and clean typography.

Color Palette:

Primary: Slate-900 (Dark backgrounds), Blue-600 to Indigo-600 (Gradients/Accents).

Text: Slate-50 for headings on dark, Slate-300 for body text.

Print Styles: Crucial: The site uses specific CSS overrides for printing. All dark backgrounds are forced to white and text to black during PDF generation (window.print()).

Animations: Use subtle entrance animations (fade-in, slide-up) for sections. Avoid aggressive motion that distracts from the content.

3. Component Architecture
BookingModal:

Usage: This is a shared component used by all CTA buttons ("Book Strategy Call," "Let's Talk").

Configuration: Wraps the Calendly iframe.

Maintenance: Update the Calendly URL here to reflect changes across the entire site instantly.

AI Chatbot:

Behavior: Persistent floating component.

Logic: Detects the current page route to customize the greeting.

Estimator Integration: Contains specific logic to read the user's intent and generate structured prompts for the Estimator form.

Estimator Tool:

State Management: Multi-step form wizard. Data persists until submission or refresh.

PDF Generation: Do not use html2canvas. The system relies on native browser printing (window.print()) with a dedicated @media print CSS block to generate clean quotes.

4. Development & Contribution
Adding New Pages:

Create the component in pages/.

Add the route in App.tsx.

Update Navigation.tsx (ensure mobile menu is also updated).

Modifying the Estimator:

When adding new tech stack options, update both the selection UI and the cost calculation logic to ensure quotes remain accurate.

5. Accessibility (A11y) Checklist
Modals: Ensure DialogTitle and DialogDescription are present (even if visually hidden via sr-only) for screen readers.

Forms: All inputs in the Estimator must have associated labels.

Contrast: Verify that text over gradient backgrounds maintains a 4.5:1 contrast ratio.