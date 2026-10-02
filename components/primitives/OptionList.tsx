import type { KeyboardEvent, ReactNode } from "react";
import styles from "./Reference.module.css";

type OptionListProps = {
  children: ReactNode;
  label: string;
  onBack?: () => void;
  className?: string;
};

export function OptionList({ children, label, onBack, className = "" }: OptionListProps) {
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Backspace" && onBack) {
      event.preventDefault();
      onBack();
      return;
    }
    const direction = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1
      : event.key === "ArrowUp" || event.key === "ArrowLeft" ? -1 : 0;
    if (!direction) return;
    const options = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("[role='radio']:not(:disabled)"));
    const current = options.indexOf(document.activeElement as HTMLButtonElement);
    if (current < 0 || options.length === 0) return;
    event.preventDefault();
    options[(current + direction + options.length) % options.length].focus();
  }

  return <div role="radiogroup" aria-label={label} onKeyDown={handleKeyDown} className={`${styles.optionList} ${className}`}>{children}</div>;
}
