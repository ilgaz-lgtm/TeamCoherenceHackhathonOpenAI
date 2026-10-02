import styles from "./Reference.module.css";

export function BrandMark({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`${styles.brandMark} ${className}`} />;
}
