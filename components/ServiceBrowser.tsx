"use client";

import { useState } from "react";
import { FieldLabel } from "@/components/primitives";
import { serviceCategories, servicesFor } from "@/lib/ui/services";
import type { ViewerRole } from "@/lib/ui/personas";

export function ServiceBrowser({ role, businessType, mode, quoteBrief, shortlist, onShortlist, initialCategory }: {
  role: ViewerRole; businessType?: string; mode: string; quoteBrief: string; shortlist: string[]; onShortlist: (id: string) => void; initialCategory?: string;
}) {
  const [category, setCategory] = useState(initialCategory ?? "all");
  const [query, setQuery] = useState("");
  const [onlySaved, setOnlySaved] = useState(false);
  const [copied, setCopied] = useState("");
  const all = servicesFor({ role, businessType }).filter((item) => {
    const definition = serviceCategories.find((entry) => entry.id === item.category);
    return mode === "business" ? definition?.roles?.length === 1 && definition.roles[0] === "founder" : !(definition?.roles?.length === 1 && definition.roles[0] === "founder");
  });
  const categories = serviceCategories.filter((item) => all.some((provider) => provider.category === item.id));
  const providers = all.filter((item) => (category === "all" || item.category === category) && (!onlySaved || shortlist.includes(item.id)) && `${item.name} ${item.summary} ${item.category}`.toLowerCase().includes(query.toLowerCase()));
  async function copyBrief() {
    try { await navigator.clipboard.writeText(quoteBrief); setCopied("Brief copied. Paste it into your chosen provider's enquiry form."); }
    catch { setCopied("Copy is unavailable in this browser. The brief is shown below for selection."); }
  }
  return <section className="mt-8" aria-labelledby="services-title">
    <FieldLabel>{mode === "business" ? businessType || "Your business" : "Arrive prepared"}</FieldLabel>
    <h2 id="services-title" className="mt-2 font-heading text-3xl font-semibold uppercase">{mode === "business" ? "Business services" : "Everyday life"}</h2>
    <p className="mt-4 max-w-3xl text-sm text-ink-muted">{mode === "business" ? "Find setup and PRO support, hiring services and specialists matched to your business. Ask for an itemised scope before appointing anyone." : "Find the services you will use after landing: transport, food, groceries, mobile connections and vehicles. Check coverage at your actual address."}</p>
    <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_1fr]">
      <label className="flex flex-col gap-2 text-xs text-ink-muted">Search services<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} className="min-h-11 min-w-0 border border-rule bg-paper-raised px-3 text-sm text-ink" /></label>
      <label className="flex flex-col gap-2 text-xs text-ink-muted">Category<select value={category} onChange={(event) => setCategory(event.target.value)} className="min-h-11 min-w-0 border border-rule bg-paper-raised px-3 text-sm text-ink"><option value="all">All relevant services</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
    </div>
    <div className="my-5 flex flex-wrap items-center justify-between gap-3"><p role="status" className="font-mono text-[11px] text-ink-muted">{providers.length} providers</p><label className="flex min-h-11 items-center gap-2 text-xs"><input type="checkbox" checked={onlySaved} onChange={(event) => setOnlySaved(event.target.checked)} className="accent-survey" />My shortlist only</label></div>
    <div className="grid gap-px border border-rule bg-rule md:grid-cols-2">
      {providers.map((item) => <article key={item.id} className="flex min-w-0 flex-col bg-paper-raised p-5">
        <FieldLabel>{serviceCategories.find((entry) => entry.id === item.category)?.label} / {item.kind === "official" ? "Official channel" : item.placement === "editorial" ? "Independent listing" : "Sponsored placement"}</FieldLabel>
        <h3 className="mt-3 font-heading text-2xl font-semibold uppercase">{item.name}</h3><p className="mt-3 text-sm">{item.summary}</p>
        {item.note && <p className="mt-3 text-xs text-ink-muted">{item.note.replace(/^Commercial example, not endorsed or paid; /, "").replace(/^./, (letter) => letter.toUpperCase())}</p>}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-5"><a href={item.url} target="_blank" rel="noopener noreferrer" className="min-h-11 border-b border-accent py-2 font-mono text-[11px] uppercase">Visit provider ↗</a><button type="button" aria-pressed={shortlist.includes(item.id)} onClick={() => onShortlist(item.id)} className="min-h-11 border-b border-rule py-2 font-mono text-[11px] uppercase">{shortlist.includes(item.id) ? "Remove from shortlist" : "Shortlist +"}</button></div>
        <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-3 w-fit py-1 text-[11px] text-ink-muted underline">Provider information ↗</a>
      </article>)}
    </div>
    {providers.length === 0 && <p className="border-t border-rule py-6 text-sm">No matching services. Change the category, search or shortlist filter.</p>}
    {mode === "business" && <section className="mt-8 border-t border-rule pt-6"><h3 className="font-heading text-xl font-semibold uppercase">Ask for a comparable quote</h3><p className="mt-3 max-w-3xl select-text text-sm text-ink-muted">{quoteBrief}</p><button type="button" onClick={copyBrief} className="mt-4 min-h-11 border-b border-accent font-mono text-xs uppercase">Copy enquiry brief</button>{copied && <p role="status" className="mt-3 text-xs">{copied}</p>}</section>}
    <p className="mt-8 border-t border-rule pt-4 text-xs text-ink-muted">Listings are selected for relevance, not a guarantee of service or approval. Commercial providers set their own terms. Any paid placement is labelled separately; none is presented as an authority recommendation.</p>
  </section>;
}
