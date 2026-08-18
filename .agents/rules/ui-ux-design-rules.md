# Workspace UI/UX, Design Taste & Shadcn Standards

When modifying, generating, or refactoring UI components, pages, and layouts in this project, adhere strictly to the following rules:

## 1. Aesthetic Excellence & Design Taste
- **Bespoke Styling**: Avoid generic AI templates or unstyled default HTML elements.
- **Glassmorphism & Lighting**: Leverage subtle glass backgrounds (`bg-slate-900/60 backdrop-blur-md`), 1px semi-transparent borders (`border border-white/10`), and tailored glow effects.
- **Typography Pairing**: Use `Plus Jakarta Sans` for body/headings and `Space Mono` for monospace counters, timer clocks, or code labels.

## 2. UI/UX Pro Max Principles
- **State Completeness**: Always implement hover, active (`scale-[0.98]`), focus-visible rings, disabled, skeleton loading, empty, and error states.
- **Micro-Animations**: Animate modals, popups, and tab switches using `framer-motion` with spring curves or smooth easing.
- **Accessibility**: Ensure high text contrast ratios (minimum 4.5:1), keyboard navigation (`Escape` to close modals), and `aria-label`s on icon-only buttons.
- **Touch Ergonomics**: Maintain minimum 44x44px touch targets for mobile accessibility.

## 3. Shadcn UI Component Conventions
- **Component Location**: Place reusable primitives in `src/components/ui/` (e.g. `button.jsx`, `card.jsx`, `badge.jsx`, `input.jsx`, `dialog.jsx`, `tabs.jsx`, `skeleton.jsx`).
- **Class Merging**: Always use `cn(...)` from `src/lib/utils.js` to allow class overriding and merging with Tailwind.
- **Variants via CVA**: Use `class-variance-authority` (cva) for defining component variants (e.g. `default`, `outline`, `destructive`, `ghost`, `glow`).
