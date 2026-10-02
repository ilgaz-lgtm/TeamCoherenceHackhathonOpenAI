"use client";

import { useState } from "react";
import { FieldLabel } from "@/components/primitives";
import { knowledge } from "@/lib/ui/knowledge";
import type { ViewerRole } from "@/lib/ui/personas";

export function KnowledgePanel({ role }: { role: ViewerRole }) {
  const [query, setQuery] = useState("");
  const entries = knowledge.filter((item) => item.roles.includes(role) && `${item.question} ${item.answer} ${item.topics.join(" ")}`.toLowerCase().includes(query.toLowerCase()));
  return <section className="mt-8" aria-labelledby="knowledge-title">
    <FieldLabel>Before you arrive</FieldLabel><h2 id="knowledge-title" className="mt-2 font-heading text-3xl font-semibold uppercase">Questions & answers</h2>
    <label className="mt-6 flex flex-col gap-2 text-xs text-ink-muted">Search a question or topic<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} className="min-h-11 border border-rule bg-paper-raised px-3 text-sm text-ink" /></label>
    <p role="status" className="my-4 font-mono text-[11px] text-ink-muted">{entries.length} answers for your case</p>
    <div className="border-b border-rule">{entries.map((item) => <details key={item.id} className="border-t border-rule py-5">
      <summary className="cursor-pointer font-heading text-xl font-semibold uppercase">{item.question}</summary>
      <p className="mt-4 max-w-3xl text-sm leading-relaxed">{item.answer}</p>
      <div className="mt-4 flex flex-wrap gap-5 text-xs"><a href={item.action.url} target="_blank" rel="noopener noreferrer" className="min-h-11 border-b border-accent py-2">{item.action.label} ↗</a><a href={item.source.url} target="_blank" rel="noopener noreferrer" className="min-h-11 border-b border-rule py-2">Source: {item.source.title} ↗</a></div>
    </details>)}</div>
    {entries.length === 0 && <p className="py-6 text-sm">No matching answer. Try visa, tenancy, school, insurance or banking.</p>}
  </section>;
}
