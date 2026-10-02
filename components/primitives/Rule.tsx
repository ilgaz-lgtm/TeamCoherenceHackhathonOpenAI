import type { ComponentPropsWithoutRef } from "react";

type RuleProps = ComponentPropsWithoutRef<"hr"> & {
  strong?: boolean;
};

export function Rule({ strong = false, className = "", ...props }: RuleProps) {
  return (
    <hr
      {...props}
      className={`m-0 border-0 border-t ${strong ? "border-rule-strong" : "border-rule"} ${className}`}
    />
  );
}
