import type { ComponentPropsWithoutRef } from "react";
import styles from "./Reference.module.css";

type OptionRowProps = Omit<ComponentPropsWithoutRef<"button">, "children"> & {
  index: number | string;
  label: string;
  consequence: string;
  selected?: boolean;
};

export function OptionRow({ index, label, consequence, selected = false, className = "", ...props }: OptionRowProps) {
  return (
    <button
      type="button"
      {...props}
      role="radio"
      aria-checked={selected}
      className={`${styles.optionRow} ${selected ? styles.optionSelected : ""} ${className}`}
    >
      <span className={styles.optionIndex}>{String(index).padStart(2, "0")}</span>
      <span className={styles.optionLabel}>{label}</span>
      <span aria-hidden="true" className={styles.optionLeader} />
      <span className={styles.optionConsequence}>{consequence}</span>
    </button>
  );
}
