---
name: ui-ux-pro-max
description: >-
  Comprehensive UI/UX engineering, user experience heuristics, design token architecture,
  accessibility standards (WCAG 2.1 AA), full interaction state matrix, responsive ergonomics,
  and delightful visual feedback. Use when building, auditing, or refactoring user interfaces,
  forms, interactive workflows, dashboards, or modal dialogues.
---

# UI / UX Pro Max — Design & Engineering Standards

A master-level guide for creating intuitive, high-converting, accessible, and resilient user experiences.

---

## 1. UX Heuristics & Cognitive Load

### Visibility of System Status
- Every asynchronous action **must** show immediate feedback:
  - Button loading state (`spinner` replacing or next to icon, button disabled to prevent double-click).
  - Skeleton screens during initial load instead of empty white screens or jarring spinners.
  - Success toasts with distinct action badges (e.g. "Task created", "Synced with cloud").

### Match Between System and the Real World
- Use natural language and intuitive spatial metaphors (e.g., swipe to dismiss, pin to top, archive vs delete).
- Group information logically with clear progressive disclosure (simple by default, powerful on demand).

### Error Prevention & Recovery
- Destructive actions (e.g. deleting tasks, clearing vaults) **must** have confirmation dialogs with clear consequences.
- Form inputs should provide instant inline validation with actionable error messages (never just "Invalid input").

---

## 2. Comprehensive State Matrix

Every interactive component must explicitly handle all 8 states:

| State | Visual Treatment & Behavior |
| :--- | :--- |
| **1. Idle / Default** | Standard token contrast, balanced background and border. |
| **2. Hover** | Subtle brightness lift, background tint (`bg-accent/10`), shadow elevation (`shadow-md`). |
| **3. Active / Pressed** | Scale compression (`scale-[0.97]`), active border highlight. |
| **4. Focus Visible** | Accessible ring offset (`focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent`). |
| **5. Disabled** | Reduced opacity (`opacity-50 pointer-events-none cursor-not-allowed`), tooltip explaining why if relevant. |
| **6. Loading / Skeleton**| Shimmer gradient animation, maintaining exact content dimensions to prevent Cumulative Layout Shift (CLS). |
| **7. Empty State** | Engaging illustration or Lucide icon, encouraging copy, and a prominent primary CTA button. |
| **8. Error State** | Soft red background tint (`bg-red-500/10`), crisp red border (`border-red-500/30`), clear recovery guidance. |

---

## 3. Accessibility (WCAG 2.1 AA/AAA)

1. **Color Contrast**:
   - Normal text: Minimum 4.5:1 contrast ratio against the background.
   - Large text (18pt+ or 14pt bold): Minimum 3:1 contrast ratio.
   - UI components and graphical objects: Minimum 3:1 contrast ratio.
2. **Keyboard Navigation & ARIA**:
   - Modals and drawers must trap focus and close on `Escape` key press.
   - Interactive custom elements must include appropriate ARIA roles (`role="button"`, `aria-expanded`, `aria-label`).
   - Use semantic HTML tags (`<nav>`, `<main>`, `<article>`, `<aside>`, `<header>`, `<footer>`, `<button>`).
3. **Screen Reader Friendliness**:
   - Provide `aria-label` for icon-only buttons (e.g., `<button aria-label="Close dialog">`).

---

## 4. Mobile & Touch Ergonomics

1. **Touch Targets**:
   - All clickable items must have a minimum tap area of **44x44px** on mobile devices.
2. **Thumb Zone Architecture**:
   - Place primary actions in the bottom 50% of the viewport on mobile screens (FABs, bottom navs, bottom action sheets).
   - Reserve the top for status headers, search, and navigation breadcrumbs.
3. **Responsive Breakpoints**:
   - Mobile (`< 640px`): Single column, full-width inputs, bottom drawers.
   - Tablet (`640px - 1024px`): 2-column bento grids, collapsible sidebars.
   - Desktop (`> 1024px`): Multi-column layouts, sticky side navigation, split inspection panels.

---

## 5. Design Token Hierarchy

```css
:root {
  /* Semantic Backgrounds */
  --bg-canvas: #090d16;
  --bg-surface: #121826;
  --bg-elevated: #1a2235;
  --bg-overlay: rgba(9, 13, 22, 0.75);

  /* Semantic Borders */
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-focus: #3b82f6;

  /* Text Contrast */
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;

  /* Accents */
  --accent-primary: #3b82f6;
  --accent-glow: rgba(59, 130, 246, 0.35);
}
```
