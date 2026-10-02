import type { ComponentPropsWithoutRef } from "react";

type SheetProps = ComponentPropsWithoutRef<"section"> & {
  level?: "sunk" | "flat" | "raised";
  titleBlock?: string;
};

const levelClasses = {
  sunk: "border border-rule bg-paper-sunk",
  flat: "border border-rule bg-paper",
  raised: "paper-edge",
} as const;

export function Sheet({
  level = "flat",
  titleBlock,
  className = "",
  children,
  ...props
}: SheetProps) {
  return (
    <section {...props} className={`${levelClasses[level]} ${className}`}>
      {titleBlock && (
        <div className="border-b border-rule px-6 py-3 font-mono text-[11px] font-medium uppercase text-ink-muted sm:px-8">
          {titleBlock}
        </div>
      )}
      <div className="p-6 sm:p-8">{children}</div>
    </section>
  );
}
