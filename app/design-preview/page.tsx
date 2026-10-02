import { DesignPreview } from "./DesignPreview";

export const dynamic = "force-dynamic";

export default function DesignPreviewPage() {
  const today = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Dubai",
  }).format(new Date()).toUpperCase();

  return <DesignPreview today={today} />;
}
