import type { ComponentPropsWithoutRef } from "react";

type SourceBadgeProps = Omit<ComponentPropsWithoutRef<"span">, "children"> & {
  source: string;
};

export function SourceBadge({ source, className = "", ...props }: SourceBadgeProps) {
  return (
    <span
      {...props}
      className={`inline-flex items-center border-l-2 border-verified px-2 py-1 font-mono text-[11px] font-medium uppercase text-verified ${className}`}
    >
      Source: {source}
    </span>
  );
}
