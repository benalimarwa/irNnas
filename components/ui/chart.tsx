// components/ui/chart.tsx
"use client";

import * as React from "react";

export type ChartConfig = Record<
  string,
  {
    label?: string;
    color?: string;
  }
>;

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    config: ChartConfig;
  }
>(({ className, children, config, ...props }, ref) => {
  return (
    <div ref={ref} className={className} {...props}>
      {children}
    </div>
  );
});
ChartContainer.displayName = "ChartContainer";

// CORRECTION ICI : on accepte "content" au lieu de "children"
const ChartTooltip = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    content?: React.ReactNode;
  }
>(({ content, ...props }, ref) => {
  // Recharts passe le contenu via la prop "content"
  return content ? <div ref={ref} {...props}>{content}</div> : null;
});
ChartTooltip.displayName = "ChartTooltip";

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    hideLabel?: boolean;
    indicator?: "line" | "dot" | "dashed";
  }
>(({ className, hideLabel, indicator = "dot", ...props }, ref) => {
  // Ici tu peux personnaliser l'apparence du tooltip
  // Pour l'instant on rend un tooltip basique mais stylé
  return (
    <div
      ref={ref}
      className={`rounded-lg border bg-white px-3 py-2 text-sm shadow-lg ${className}`}
      {...props}
    />
  );
});
ChartTooltipContent.displayName = "ChartTooltipContent";

export { ChartContainer, ChartTooltip, ChartTooltipContent };