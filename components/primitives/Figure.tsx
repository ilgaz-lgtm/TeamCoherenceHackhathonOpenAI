import type { ComponentPropsWithoutRef } from "react";
import { formatAed, formatNumber } from "@/lib/ui/format";

type FigureProps = Omit<ComponentPropsWithoutRef<"span">, "children"> & (
  | { value: number; format?: "number" | "aed" }
  | { value: string; format?: "text" }
);

export function Figure({ value, format, className = "", ...props }: FigureProps) {
  const display = typeof value === "number"
    ? format === "aed" ? formatAed(value) : formatNumber(value)
    : value;

  return (
    <span {...props} className={`figure whitespace-nowrap font-medium ${className}`}>
      {display}
    </span>
  );
}
