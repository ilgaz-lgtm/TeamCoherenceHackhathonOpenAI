import type { ReactNode } from "react";

type FieldLabelProps = {
  children: ReactNode;
  className?: string;
  htmlFor?: string;
  id?: string;
};

export function FieldLabel({ children, className = "", htmlFor, id }: FieldLabelProps) {
  const classes = `font-mono text-[11px] font-medium uppercase text-ink-muted ${className}`;

  if (htmlFor) {
    return <label htmlFor={htmlFor} id={id} className={classes}>{children}</label>;
  }

  return <span id={id} className={classes}>{children}</span>;
}
