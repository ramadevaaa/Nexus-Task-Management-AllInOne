import * as React from "react";
import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-slate-800/70 dark:bg-slate-800/80",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
