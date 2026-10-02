import type { ComponentPropsWithoutRef } from "react";

type AnnotationProps = ComponentPropsWithoutRef<"span">;

export function Annotation({ className = "", ...props }: AnnotationProps) {
  return (
    <span
      {...props}
      className={`font-mono text-[11px] leading-5 text-ink-faint ${className}`}
    />
  );
}
