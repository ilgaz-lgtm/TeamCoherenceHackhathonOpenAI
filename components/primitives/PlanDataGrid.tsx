import styles from "./Reference.module.css";

export type PlanDataCell = {
  key: string;
  label: string;
  value: string;
  span?: 1 | 2;
  accent?: boolean;
};

export function PlanDataGrid({ cells, className = "" }: { cells: PlanDataCell[]; className?: string }) {
  return (
    <dl className={`${styles.dataGrid} ${className}`}>
      {cells.map((cell) => (
        <div key={cell.key} className={`${styles.dataCell} ${cell.span === 2 ? styles.dataCellWide : ""}`}>
          <dt className={styles.dataKey}>{cell.label}</dt>
          <dd className={`${styles.dataValue} ${cell.accent ? styles.dataValueAccent : ""}`}>{cell.value}</dd>
        </div>
      ))}
    </dl>
  );
}
