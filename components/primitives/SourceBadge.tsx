import type { ComponentPropsWithoutRef } from "react";

type SourceBadgeProps = Omit<ComponentPropsWithoutRef<"span">, "children"> & (
  | { authority: string; source?: never }
  | { source: string; authority?: never }
);

export function SourceBadge({ source, authority, className = "", ...props }: SourceBadgeProps) {
  return (
    <span
      {...props}
      className={`inline-flex flex-wrap items-center gap-x-2 gap-y-0.5 border border-rule px-2 py-1 font-mono text-[10px] font-medium uppercase text-ink-muted ${className}`}
    >
      {authority ? <><span>Per {authority}</span><span aria-hidden="true">·</span><span>Not yet verified</span></> : <span>{source}</span>}
    </span>
  );
}
