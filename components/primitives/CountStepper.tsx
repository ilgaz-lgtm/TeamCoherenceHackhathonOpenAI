import styles from "./Reference.module.css";

type CountStepperProps = {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
};

export function CountStepper({ label, value, min = 1, max = 100, onChange }: CountStepperProps) {
  return (
    <div role="group" aria-label={label} className={styles.stepper}>
      <button type="button" aria-label={`Decrease ${label}`} disabled={value <= min} onClick={() => onChange(value - 1)} className={styles.stepperButton}>−</button>
      <output aria-label={label} className={styles.stepperValue}>{value}</output>
      <button type="button" aria-label={`Increase ${label}`} disabled={value >= max} onClick={() => onChange(value + 1)} className={styles.stepperButton}>+</button>
    </div>
  );
}
