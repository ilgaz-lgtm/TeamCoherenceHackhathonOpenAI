import type { ComponentPropsWithoutRef } from "react";

type StampProps = ComponentPropsWithoutRef<"span"> & { compact?: boolean };

export function Stamp({ className = "", compact = false, style, ...props }: StampProps) {
  return (
    <span
      {...props}
      className={`inline-flex items-center border border-ink bg-transparent font-mono font-medium uppercase text-ink ${compact ? "px-1.5 py-0.5 text-[9.5px]" : "min-h-8 px-3 py-1 text-[11px]"} ${className}`}
      style={{ ...style, transform: "rotate(-2deg)" }}
    />
  );
}
