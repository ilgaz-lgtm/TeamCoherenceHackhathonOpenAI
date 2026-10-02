import { ScopeExperience } from "@/components/ScopeExperience";
import { Annotation, FieldLabel } from "@/components/primitives";
import { demoCompany, demoEmployee, demoRelocation } from "@/lib/demo/data";

export default function Home() {
  return (
    <main className="mx-auto max-w-[1120px] px-6 pb-20 pt-8 sm:px-8 sm:pt-12 lg:px-12">
      <header className="border-b border-rule-strong pb-8">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <FieldLabel>Abu Dhabi / Case files</FieldLabel>
          <Annotation>Two sample profiles</Annotation>
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
          Company setup and people relocation, in the order they can happen.
        </p>
      </header>

      <ScopeExperience company={demoCompany} employee={demoEmployee} plan={demoRelocation.plan} />
    </main>
  );
}
