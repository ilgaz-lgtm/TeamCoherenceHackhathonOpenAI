import { demoCompany, demoEmployee, demoRelocation } from "@/lib/demo/data";
import {
  Annotation,
  DrawnLine,
  FieldLabel,
  Figure,
  Rule,
  Sheet,
  SourceBadge,
  Stamp,
} from "@/components/primitives";
import { formatDuration } from "@/lib/ui/format";

export default function Home() {
  return (
    <main className="mx-auto max-w-[1120px] px-6 pb-16 pt-8 sm:px-8 sm:pt-12 lg:px-12">
      <header className="border-b border-rule-strong pb-8">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <FieldLabel>Relocation / Abu Dhabi</FieldLabel>
          <Annotation>Case 001 / Sample record</Annotation>
        </div>
        <div className="mt-8">
          <h1 className="font-heading text-6xl font-semibold uppercase leading-none text-ink sm:text-7xl">
            Wusool
          </h1>
          <span lang="ar" dir="rtl" className="mt-2 block w-fit font-arabic text-sm text-ink-muted">
            وصول
          </span>
        </div>
        <p className="mt-6 max-w-xl text-base text-ink-muted">
          Your move to Abu Dhabi, mapped to your employer&apos;s policy.
        </p>
      </header>

      <div className="grid gap-10 pt-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(250px,0.7fr)] lg:gap-12">
        <Sheet level="raised" titleBlock="01 / Relocation file" aria-label="Relocation file">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <FieldLabel>Employee</FieldLabel>
              <h2 className="mt-2 font-heading text-3xl font-semibold uppercase leading-tight text-ink sm:text-4xl">
                {demoEmployee.name}
              </h2>
              <p className="mt-2 text-sm text-ink-muted">
                {demoEmployee.role} / {demoCompany.name}
              </p>
            </div>
            <Stamp>Sample data</Stamp>
          </div>

          <Rule className="my-8" />

          <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
            <div className="flex flex-col items-start gap-2">
              <FieldLabel>Housing allowance / year</FieldLabel>
              <Figure value={demoCompany.policy.housingAllowanceAED} format="aed" className="text-2xl text-ink sm:text-3xl" />
              <Annotation>Company policy / Annual cap</Annotation>
            </div>
            <div className="flex flex-col items-start gap-2">
              <FieldLabel>Start date</FieldLabel>
              <Figure value={demoEmployee.startDate} className="text-xl text-ink sm:text-2xl" />
              <Annotation>Employee record / Confirm with HR</Annotation>
            </div>
          </div>

          <Rule className="my-8" />
          <SourceBadge source="Demo company policy" />
        </Sheet>

        <aside className="border-l border-rule pl-6 lg:pt-3">
          <FieldLabel>Case note</FieldLabel>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-ink">
            You are moving from {demoEmployee.movingFrom} to {demoRelocation.destination}. Your
            employer provides {formatDuration(demoCompany.policy.temporaryAccommodationDays)} of
            temporary accommodation; confirm arrangements with HR.
          </p>
          <DrawnLine
            path="M0 12 H88 V32 H176"
            width={176}
            height={44}
            className="mt-8"
          />
          <p className="mt-5">
            <Annotation>Fictional demo data. Confirm requirements with HR and relevant authorities.</Annotation>
          </p>
        </aside>
      </div>
    </main>
  );
}
