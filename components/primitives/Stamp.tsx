import type { ComponentPropsWithoutRef } from "react";

type StampProps = ComponentPropsWithoutRef<"span">;

export function Stamp({ className = "", style, ...props }: StampProps) {
  return (
    <span
      {...props}
      className={`inline-flex min-h-8 items-center border border-accent bg-transparent px-3 py-1 font-mono text-[11px] font-medium uppercase text-accent ${className}`}
      style={{ ...style, transform: "rotate(-4deg)" }}
    />
  );
}
