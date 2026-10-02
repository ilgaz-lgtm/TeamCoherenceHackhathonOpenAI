import styles from "./DrawnLine.module.css";

type DrawnLineProps = {
  path: string;
  width: number;
  height: number;
  label?: string;
  stroke?: string;
  className?: string;
};

export function DrawnLine({
  path,
  width,
  height,
  label,
  stroke = "var(--survey)",
  className = "",
}: DrawnLineProps) {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role={label ? "img" : undefined}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {label && <title>{label}</title>}
      <path
        className={styles.path}
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth="1"
        pathLength={1}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
