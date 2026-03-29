# BKT Advisory

A professional consultancy website for BKT Advisory, a technology firm led by John "JB" Burkhardt specializing in Salesforce CRM, AI systems, RevOps, and sales automation.

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 6 with `@vitejs/plugin-react-swc`
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives (shadcn/ui pattern) + Lucide React icons
- **Backend/BaaS**: Supabase (storage, database, Edge Functions via Deno/Hono)
- **AI**: OpenAI GPT-4o via Supabase Edge Functions
- **Package Manager**: npm

## Project Structure

```
src/
  assets/         # Images and static assets
  components/     # React components
    ui/           # Reusable UI primitives (shadcn/ui pattern)
    figma/        # Figma-specific helpers
    AIChatbot.tsx # AI-powered chatbot
    Estimator.tsx # Tech Project Estimator multi-step form
    ...           # Page and section components
  guidelines/     # Project and AI behavior guidelines
  styles/         # Global CSS
  supabase/
    functions/    # Edge Functions (Deno/Hono) for AI chatbot
  utils/          # Helper functions and Supabase clients
  App.tsx         # Main App + PWA manifest
  main.tsx        # Entry point
  routes.tsx      # Route definitions
```

## Key Features

1. **Tech Project Estimator**: Multi-step form calculating CRM project complexity and costs
2. **AI Chatbot**: GPT-4o powered assistant for scoping projects and booking calls
3. **PWA Support**: Dynamic web app manifest for "Add to Home Screen"
4. **Google Calendar Integration**: For booking strategy calls

## Development

```bash
npm install
npm run dev     # Starts dev server on port 5000
npm run build   # Builds to ./build directory
```

## Replit Configuration

- Dev server runs on port 5000 (`0.0.0.0`) with `allowedHosts: true` for proxy compatibility
- Deployment: Static site — builds with `npm run build`, serves from `./build`
- Supabase environment variables needed: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- OpenAI API key needed for AI chatbot: configured in Supabase Edge Function environment
