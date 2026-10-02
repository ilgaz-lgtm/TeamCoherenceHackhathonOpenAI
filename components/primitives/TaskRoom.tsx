import { SourceBadge } from "./SourceBadge";
import { Stamp } from "./Stamp";
import styles from "./Reference.module.css";

export type TaskRoomData = {
  id: string;
  category: string;
  title: string;
  description: string;
  rationale: string;
  status: "ready" | "queued" | "blocked" | "in_progress" | "done" | "optional";
  columns: number;
  rows?: number;
  critical?: boolean;
  bridge?: boolean;
  authority?: string;
  estimateWorkingDays?: { low: number; high: number };
  provider?: string;
  waitingOn?: string[];
  rootBlocker?: string;
};

const statusLabels = {
  ready: "READY",
  queued: "QUEUED",
  blocked: "BLOCKED",
  in_progress: "IN PROGRESS",
  done: "DONE",
  optional: "OPTIONAL",
} as const;

export function TaskRoom({ task }: { task: TaskRoomData }) {
  const large = (task.rows ?? 1) > 1 || task.columns >= 7;
  const blocked = task.status === "blocked";
  const className = [
    styles.room,
    task.critical ? styles.roomCritical : "",
    blocked ? styles.roomBlocked : "",
    task.status === "optional" ? styles.roomOptional : "",
    task.bridge ? styles.roomBridge : "",
    large ? styles.roomLarge : "",
  ].filter(Boolean).join(" ");

  return (
    <article className={className} style={{ gridColumn: `span ${Math.max(1, Math.min(12, task.columns))}`, gridRow: `span ${Math.max(1, task.rows ?? 1)}` }}>
      <div className={styles.roomMeta}>
        <span className={styles.roomId}>{task.id} · {task.category.toUpperCase()}</span>
        <span className={styles.roomStatus}>{task.critical && !blocked ? "CRITICAL · " : ""}{statusLabels[task.status]}</span>
      </div>
      <h3 className={styles.roomTitle}>{task.title}</h3>
      <p className={styles.roomDescription}>{task.description}</p>
      <p className={styles.roomRationale}>{task.rationale}</p>
      {blocked && task.waitingOn && task.waitingOn.length > 0 && (
        <div className={styles.roomWaiting}>
          <span>WAITING ON: {task.waitingOn.join(", ")}</span>
          {task.rootBlocker && <span className={styles.roomRootBlocker}>ROOT BLOCKER: {task.rootBlocker}</span>}
        </div>
      )}
      {task.provider && (
        <div className={styles.roomProvider}>
          <span className={styles.roomProviderLabel}>PROVIDERS</span>
          <span>{task.provider}</span>
          <Stamp compact>SAMPLE DATA</Stamp>
        </div>
      )}
      <div className={styles.roomFoot}>
        {task.estimateWorkingDays && <span className={styles.durationBadge}>EST. {task.estimateWorkingDays.low}–{task.estimateWorkingDays.high} WORKING DAYS · TODO(verify)</span>}
        {task.authority && <SourceBadge authority={task.authority} />}
      </div>
    </article>
  );
}

export function TaskRoomGrid({ tasks, className = "" }: { tasks: TaskRoomData[]; className?: string }) {
  return <div className={`${styles.roomGrid} ${className}`}>{tasks.map((task) => <TaskRoom key={task.id} task={task} />)}</div>;
}
