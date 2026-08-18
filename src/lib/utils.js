import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS class names with clsx and twMerge.
 * Essential for Shadcn UI components.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
