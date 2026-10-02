const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

export function formatNumber(value: number): string {
  return numberFormatter.format(value).replaceAll(",", " ");
}

export function formatAed(value: number): string {
  return `AED ${formatNumber(value)}`;
}

export function formatRange(
  start: number,
  end: number,
  formatter: (value: number) => string = formatNumber,
): string {
  return start === end
    ? formatter(start)
    : `${formatter(start)}\u2013${formatter(end)}`;
}

export function formatDuration(days: number, working = false): string {
  const unit = working ? "working day" : "day";
  return `${formatNumber(days)} ${unit}${days === 1 ? "" : "s"}`;
}
