---
name: shadcn
description: >-
  Build, scaffold, and compose reusable UI components following the shadcn/ui architecture.
  Uses Tailwind CSS, Class Variance Authority (CVA), clsx, and tailwind-merge (via the cn utility).
  Use when creating new UI components (buttons, dialogs, cards, badges, inputs, dropdowns, tabs),
  refactoring existing components to shadcn patterns, or standardizing component props and variants.
---

# Shadcn UI — Architecture & Component Guide

`shadcn/ui` is a copy-paste component architecture designed for flexibility, zero runtime overhead, complete styling control via Tailwind CSS, and accessible primitives.

---

## 1. Core Utilities (`cn` Helper)

All shadcn components use the standard `cn` helper to cleanly merge Tailwind classes:

```javascript
// src/lib/utils.js
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

---

## 2. Component Variant Pattern (Class Variance Authority)

Use `cva` to define component variants, sizes, and default values in a type-safe and declarative manner:

```jsx
// src/components/ui/button.jsx
import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white shadow-md hover:bg-blue-500 shadow-blue-500/20",
        destructive: "bg-red-500 text-white shadow-sm hover:bg-red-600 shadow-red-500/20",
        outline: "border border-white/10 bg-transparent hover:bg-white/5 text-slate-200",
        secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700/50",
        ghost: "hover:bg-white/5 text-slate-300 hover:text-white",
        glow: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:brightness-110",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-2xl px-6 text-base",
        icon: "h-9 w-9 rounded-lg p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };
```

---

## 3. Standard Component Blueprints

### Card Component
```jsx
// src/components/ui/card.jsx
import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md text-slate-100 shadow-xl transition-all",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight text-white", className)} {...props} />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-slate-400", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
```

### Badge Component
```jsx
// src/components/ui/badge.jsx
import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-blue-600/20 text-blue-400 border border-blue-500/30",
        secondary: "border-transparent bg-slate-800 text-slate-300 border border-slate-700",
        destructive: "border-transparent bg-red-500/20 text-red-400 border border-red-500/30",
        success: "border-transparent bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
        outline: "text-slate-300 border-white/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
```

---

## 4. Best Practices for shadcn in React / Vite Projects

1. **Keep components in `src/components/ui/`**: Keep atomic UI primitives cleanly separated from feature components.
2. **Prop forwarding with `forwardRef`**: Always forward refs and spread `...props` to allow full customization.
3. **Compose with `framer-motion`**: For animated components (Modals, Dialogs, Dropdowns, Sheets), wrap with `framer-motion`'s `AnimatePresence` and `motion.div`.
4. **Theme Awareness**: Use Tailwind classes that adapt smoothly to both dark and light modes using CSS variables or `.dark` class selectors.
