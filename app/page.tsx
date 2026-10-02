import { OnboardingExperience } from "@/components/OnboardingExperience";
import { demoCompany, demoEmployee, demoRelocation } from "@/lib/demo/data";

export const dynamic = "force-dynamic";

export default function Home() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Dubai",
  }).formatToParts(new Date());
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  const todayISO = `${part("year")}-${part("month")}-${part("day")}`;

  return <OnboardingExperience company={demoCompany} employee={demoEmployee} plan={demoRelocation.plan} todayISO={todayISO} />;
}
