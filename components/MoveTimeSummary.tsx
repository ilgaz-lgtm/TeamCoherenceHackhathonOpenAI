import type { BlockingContext, ScopedTask } from "@/lib/ui/scope";
import { getTaskTiming } from "@/lib/ui/timing";
import { dayFromToday } from "@/lib/ui/onboarding";
import styles from "./PlanWorkspace.module.css";

const dateFormatter = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const displayDate = (date: string) => dateFormatter.format(new Date(`${date}T00:00:00Z`));

export function MoveTimeSummary({ items, completed, targetDate, todayISO }: {
  items: ScopedTask[]; all: ScopedTask[]; completed: ReadonlySet<string>; external: BlockingContext[]; targetDate: string; todayISO: string;
}) {
  const company = items.some((task) => task.layer === "company");
  const groups = company ? [
    { label: "Business premises", ids: ["lease"] },
    { label: "Licence issuance", ids: ["licence"] },
    { label: "Business account", ids: ["business-bank"] },
  ] : [
    { label: "Entry permission", ids: ["visa", "founder-residence", "family-entry", "family-sponsorship"] },
    { label: "Home search & lease", ids: ["family-home", "housing-tenancy", "housing"] },
    { label: "School placement", ids: ["family-school", "school"] },
  ];
  const highlights = groups.flatMap((group) => {
    const task = group.ids.map((id) => items.find((item) => item.id === id)).find(Boolean);
    if (!task) return [];
    const timing = getTaskTiming(task);
    return [{ ...group, task, timing }];
  });
  const count = items.filter((task) => completed.has(task.id)).length;
  const days = dayFromToday(targetDate, todayISO);
  return <section aria-label="Time to allow">
    <div className={styles.timelineCaption}>
      <p>Start: {displayDate(todayISO)}{Number.isFinite(days) && <> · Target: {displayDate(targetDate)} <span>({days < 0 ? "revise your past target" : `${days} days away`})</span></>}</p>
      <p>{count} / {items.length} done</p>
    </div>
    <div className={styles.metrics}>{highlights.map(({ label, task, timing }) => <div key={label}>
      <p className={styles.metricLabel}>{task.title === "Confirm employer housing" ? "Employer housing" : label}</p>
      <p className={styles.metricValue}>{completed.has(task.id) ? "Complete" : timing.basis === "indicative" ? `~${timing.days} working days` : "Confirm the date"}</p>
    </div>)}</div>
    <p className={styles.estimateNote}>Planning estimates, not published processing times. Steps can overlap; documents and appointments add separate waits.</p>
  </section>;
}
