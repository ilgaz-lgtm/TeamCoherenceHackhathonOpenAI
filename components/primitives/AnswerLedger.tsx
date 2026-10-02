import styles from "./Reference.module.css";

export type LedgerEntry = {
  id: string;
  number: string;
  keyLabel: string;
  value: string;
  onRevise: () => void;
};

type AnswerLedgerProps = {
  entries: LedgerEntry[];
  activeId?: string;
  className?: string;
};

export function AnswerLedger({ entries, activeId, className = "" }: AnswerLedgerProps) {
  return (
    <aside aria-label="Answer ledger" className={`${styles.ledger} ${className}`}>
      <div className={styles.ledgerHeader}>ANSWER LEDGER</div>
      {entries.length === 0 && <p className={styles.ledgerEmpty}>Each answer is written here as you give it. Click any line to revise it.</p>}
      <div className={styles.ledgerEntries}>
        {entries.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={entry.onRevise}
            aria-current={activeId === entry.id ? "step" : undefined}
            aria-label={`Revise ${entry.keyLabel}: ${entry.value}`}
            className={`${styles.ledgerEntry} ${activeId === entry.id ? styles.ledgerActive : ""}`}
          >
            <span className={styles.ledgerNumber}>{entry.number}</span>
            <span className={styles.ledgerKey}>{entry.keyLabel}</span>
            <span className={styles.ledgerValue}>{entry.value}</span>
          </button>
        ))}
      </div>
      <div className={styles.ledgerFoot}>NOTHING IS SAVED.<br />THIS SESSION ONLY.</div>
    </aside>
  );
}
