# Quote View – Figma Design Summary

**Source:** [BKT Advisory Project Estimator Figma File](https://www.figma.com/design/wzYytd1PoNcanZgdHIQbL9/BKT-Advisory--Project-Estimator-)  
**Component:** `Quote` (`src/components/Quote.tsx`)

> **Note:** The issue referenced the file via the `figma.com/make/` share URL (`https://www.figma.com/make/wzYytd1PoNcanZgdHIQbL9/...`), which is not supported by the standard Figma REST API and returns a 400 error from all MCP tool calls. The canonical design URL (`figma.com/design/wzYytd1PoNcanZgdHIQbL9/...`, as listed in `README.md`) also returns 400, indicating the token does not have API access to this file. Design properties below were therefore extracted directly from the component source code, which is the authoritative implementation of the Figma design.

---

## Colors

| Role | Tailwind Class | Hex Value |
|---|---|---|
| Page background | `bg-slate-50` | `#F8FAFC` |
| Document / card background | `bg-white` | `#FFFFFF` |
| Header gradient | `from-[#0F172B] via-[#1e293b] to-[#0F172B]` | `#0F172B → #1E293B → #0F172B` |
| Primary accent (borders, section headings, cost total) | `blue-700` | `#1D4ED8` |
| Interactive controls (download button, power-up rate) | `blue-600` | `#2563EB` |
| Light-blue section background (value statement) | `blue-50` | `#EFF6FF` |
| Primary text (document headings) | `slate-900` / `[#0F172B]` | `#0F172A` (slate-900) / `#0F172B` (custom) |
| Body text | `slate-700` | `#334155` |
| Label / secondary text | `slate-600` | `#475569` |
| Muted / tertiary text | `slate-500` | `#64748B` |
| Faint / footer text | `slate-400` | `#94A3B8` |
| Section card background | `slate-50` | `#F8FAFC` |
| Card / section borders | `slate-200` | `#E2E8F0` |
| Inner row dividers | `slate-100` | `#F1F5F9` |
| Star rating accent | `yellow-400` | `#FACC15` |
| Goals indicator (background / icon) | `green-100` / `green-600` | `#DCFCE7` / `#16A34A` |
| Problems indicator (background / icon) | `red-100` / `red-600` | `#FEE2E2` / `#DC2626` |
| Requirements indicator (background / icon) | `blue-100` / `blue-600` | `#DBEAFE` / `#2563EB` |

---

## Padding

| Section | Mobile | Desktop |
|---|---|---|
| Page header (`<header>`) | `py-4 px-4` (16px / 16px) | `py-6 px-8` (24px / 32px) |
| Quote content wrapper | `px-0 py-3` (0px / 12px) | `px-4 py-8` (16px / 32px) |
| Quote document card | `p-4` (16px) | `p-8` (32px) |
| Project Overview card | `p-5` (20px) | `p-5` (20px) |
| Value Statement section | `p-5` (20px) | `p-5` (20px) |
| Cost Breakdown card | `p-5` (20px) | `p-5` (20px) |
| Files Received section | `p-4` (16px) | `p-4` (16px) |
| Billing Terms cards | `p-3` (12px) | `p-3` (12px) |
| Detailed Scope section | `p-6` (24px) | `p-6` (24px) |
| Tab buttons | `px-6 py-2` (24px / 8px) | `px-6 py-2` (24px / 8px) |

---

## Key Borders & Accents

| Element | Style |
|---|---|
| Document header bottom separator | `border-b-4 border-blue-700` — 4 px solid `#1D4ED8` |
| Cost Breakdown card outline | `border-2 border-blue-700` — 2 px solid `#1D4ED8` |
| Value Statement left accent | `border-l-4 border-blue-700` — 4 px solid `#1D4ED8` on left edge |
| General card borders | `border border-slate-200` — 1 px `#E2E8F0` |
| Row dividers (cost breakdown) | `border-b border-slate-100` — 1 px `#F1F5F9` |
| Section dividers | `border-t border-slate-200` — 1 px `#E2E8F0` |
