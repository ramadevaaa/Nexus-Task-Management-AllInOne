---
name: design-taste
description: >-
  Master frontend design craftsmanship, visual hierarchy, curated aesthetic direction,
  distinctive typography pairings, bespoke color palettes, and polished micro-interactions.
  Use when designing or refining UI layouts, web applications, landing pages, or components
  to ensure they look world-class, intentional, and avoid generic "AI-generated" templates.
---

# Design Taste & Aesthetic Craftsmanship

This skill provides actionable guidelines and design doctrines to craft web interfaces with exceptional aesthetic taste, distinctive personality, and high-fidelity polish.

---

## Core Aesthetic Principles

### 1. Eliminate Generic "AI Slop"
Avoid standard AI cliches:
- **Never** use default saturated blues (`#0000ff`, `#3b82f6` on pure white with no contrast hierarchy).
- **Never** create uniform, boring 3-column card layouts with generic icons in circular containers without visual variance.
- **Never** use flat, lifeless pure grey borders (`#e5e7eb` everywhere).
- **Never** use arbitrary random border radii without an established rhythm.

### 2. Establish a Distinctive Creative Theme
Choose and stick to a clear aesthetic mood:
- **Futuristic / Cyber-Clean**: Deep obsidian backgrounds (`#090d16`, `#0d1117`), cyan/indigo ambient glows, monospace data accents (`Space Mono`, `JetBrains Mono`), semi-transparent glass cards with hairline borders (`rgba(255,255,255,0.08)`).
- **Editorial / High-End SaaS**: Warm tinted backgrounds, high-contrast serif/sans pairings, refined subtle drop shadows, razor-thin dividers, spacious padding.
- **Neo-Brutalist / Bold Minimalist**: High contrast, crisp 1-2px solid borders, intentional solid drop shadows (e.g. `box-shadow: 4px 4px 0px #000`), bold sans typography.
- **Tactile Glassmorphism**: `backdrop-blur-md` with multi-layered specular highlights, gradient borders (`linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.02))`), deep ambient shadows.

---

## Typography Hierarchy & Rhythm

1. **Font Pairings**:
   - Primary Sans: `Plus Jakarta Sans`, `Inter`, `Geist Sans`, `Outfit`
   - Data / Code / Monospace: `Space Mono`, `JetBrains Mono`, `Fira Code`
   - Display / Hero: `Cabinet Grotesk`, `Clash Display`, `Syne`
2. **Scale & Line Heights**:
   - Display: `text-4xl` to `text-6xl`, tracking tight (`tracking-tight` / `-0.02em`), line height `leading-none` or `leading-tight`.
   - Section Headers: `text-xl` to `text-2xl`, semibold / bold, subtle muted sub-labels.
   - Micro-labels / Badges: `text-[10px]` to `text-xs`, uppercase tracking wider (`tracking-wider` / `0.05em`), medium / semibold.
3. **Contrast Hierarchy**:
   - Level 1 (Headings): 100% opacity (`text-slate-100` / `text-slate-900`)
   - Level 2 (Body text): 80-85% opacity (`text-slate-300` / `text-slate-700`)
   - Level 3 (Meta/Secondary): 60% opacity (`text-slate-400` / `text-slate-500`)
   - Level 4 (Dividers/Placeholders): 20-30% opacity (`text-slate-600` / `text-slate-400`)

---

## Curated Color & Lighting Systems

1. **Never Pure Black or Pure White**:
   - Dark theme canvas: Use deep tinted tones like `#0b0f19` (midnight navy), `#0c0e14` (deep space), or `#121214` (zinc graphite).
   - Light theme canvas: Use soft cream/tinted tones like `#f8fafc`, `#f0f4ff`, or `#fdfbf7`.
2. **Glows & Ambient Light**:
   - Use radial gradient background spotlights (`bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]`) to add depth behind cards and hero sections.
   - Accent button glows: `box-shadow: 0 0 24px rgba(59, 130, 246, 0.45)`.
3. **Dynamic Accent Contrasts**:
   - Pick 1 primary punchy accent (e.g., Electric Blue `#3b82f6`, Neon Cyan `#00f2fe`, or Violet `#8b5cf6`).
   - Pair with an intentional secondary tone (e.g., Emerald `#10b981` for success, Amber `#f59e0b` for warnings, Rose `#f43f5e` for critical).

---

## Layout Density & Spatial Harmony

1. **Bento Grid Layouts**:
   - Combine asymmetric cards: 1 wide hero card (col-span-2), 1 tall metric card (row-span-2), and smaller action widgets.
   - Maintain uniform grid gaps (`gap-4` or `gap-6`).
2. **Card Anatomy**:
   - Padding: `p-5` or `p-6` for standard cards, `p-3` for compact list items.
   - Border radius: consistent `rounded-2xl` (16px) or `rounded-3xl` (24px).
   - Border treatment: 1px subtle semi-transparent border (`border border-white/10 dark:border-white/5`).
3. **Information Density**:
   - Group related controls into segmented tabs or unified toolbars.
   - Keep actions contextual (reveal on hover or anchored to card headers).

---

## Micro-Interactions & Tactile Polish

1. **Hover & Active Physics**:
   - Cards: Subtle lift on hover (`hover:-translate-y-1 transition-all duration-200 ease-out hover:shadow-lg`).
   - Buttons: Active press effect (`active:scale-[0.97] transition-transform duration-100`).
2. **Smooth Transitions**:
   - Use cubic bezier easing curves (e.g., `cubic-bezier(0.16, 1, 0.3, 1)` or standard `ease-out`).
   - Animate state transitions with `framer-motion` for layout shifts, tabs, modals, and drawers.
3. **Status Indicators**:
   - Pulsing status dots (`relative flex h-2 w-2` with `animate-ping` ping ring).
   - Smooth progress bars with gradient fills and subtle glowing heads.
