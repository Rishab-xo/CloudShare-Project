import * as React from "react"
import { cn } from "@/lib/utils"

export function GradientSlideButton({
  children,
  className,
  colorFrom = "#A855F7", // Vibrant purple
  colorTo = "#D86FF7",   // Slightly lighter magenta-purple
  ...props
}) {
  return (
    <button
      style={{
        "--color-from": colorFrom,
        "--color-to": colorTo
      }}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap text-neutral-900 transition-all duration-300 hover:scale-[105%]",
        "before:absolute before:top-0 before:left-[-100%] before:h-full before:w-full before:rounded-[inherit] before:bg-gradient-to-l before:from-[var(--color-from)] before:to-[var(--color-to)] before:transition-all before:duration-300",
        "hover:text-white hover:before:left-0",
        className
      )}
      {...props}>
      <span className="relative z-10">{children}</span>
    </button>
  );
}