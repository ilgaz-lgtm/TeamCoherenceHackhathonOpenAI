import { demoCompany, demoEmployee, demoRelocation } from "@/lib/demo/data";

export default function Home() {
  return <main className="mx-auto max-w-3xl p-8 md:p-16">
    <p className="text-sm font-semibold uppercase tracking-widest text-teal-700">Hackathon foundation</p>
    <h1 className="mt-3 text-4xl font-bold">Team Coherence</h1>
    <p className="mt-4 text-lg text-slate-600">Employer-led relocation journeys for Abu Dhabi.</p>
    <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-xl font-semibold">{demoEmployee.name} · {demoCompany.name}</h2>
      <p className="mt-2 text-slate-600">{demoRelocation.plan.summary}</p>
      <ul className="mt-4 space-y-2">{demoRelocation.plan.tasks.map((task) => <li key={task.id}>{task.title}</li>)}</ul>
    </section>
    <p className="mt-6 text-sm text-slate-500">Demo data is fictional. Frontend dashboards and onboarding are ready for your UI teammate to build.</p>
  </main>;
}
