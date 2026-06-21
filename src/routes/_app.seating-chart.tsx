import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Armchair, Shuffle, Wand2, Plus } from "lucide-react";
import { PageHeader, Section } from "@/components/page-header";
import { CLASSES, studentsFor } from "@/lib/sample-data";
import { usePersisted } from "@/hooks/use-persisted";

export const Route = createFileRoute("/_app/seating-chart")({
  head: () => ({ meta: [{ title: "Seating Chart — SchlarOS" }] }),
  component: SeatingChart,
});

type Chart = { rows: number; cols: number; seats: (string | null)[]; scores: Record<string, number> };

function seedScores(students: string[]): Record<string, number> {
  return Object.fromEntries(students.map((s, i) => [s, Math.max(20, Math.min(99, 50 + ((i * 17) % 50)))]));
}
function toneFor(score: number | undefined) {
  if (score === undefined) return "bg-white/40 text-muted-foreground border-white/40";
  if (score >= 70) return "bg-mint/25 text-mint-foreground border-mint";
  if (score >= 50) return "bg-amber/25 text-amber border-amber";
  return "bg-destructive/20 text-destructive border-destructive";
}

function SeatingChart() {
  const [klass, setKlass] = useState(CLASSES[0]);
  const [name, setName] = useState("Default Chart");
  const [store, setStore] = usePersisted<Record<string, Chart>>("tg.seating", {});
  const students = studentsFor(klass);
  const chart: Chart = store[klass] ?? { rows: 5, cols: 6, seats: Array(30).fill(null), scores: seedScores(students) };

  function update(next: Chart) { setStore({ ...store, [klass]: next }); }
  function applyGrid(rows: number, cols: number) { update({ ...chart, rows, cols, seats: Array(rows * cols).fill(null) }); }
  function autoAssign() {
    const seats = [...chart.seats];
    let i = 0;
    students.forEach((s) => { while (i < seats.length && seats[i] !== null) i++; if (i < seats.length) seats[i++] = s; });
    update({ ...chart, seats });
  }
  function shuffle() {
    const filled = students.slice().sort(() => Math.random() - 0.5);
    const seats: (string | null)[] = Array(chart.rows * chart.cols).fill(null);
    filled.forEach((s, i) => { if (i < seats.length) seats[i] = s; });
    update({ ...chart, seats });
  }
  function clear() { update({ ...chart, seats: Array(chart.rows * chart.cols).fill(null) }); }
  function assign(idx: number, student: string) {
    const seats = chart.seats.map((s) => (s === student ? null : s));
    seats[idx] = student || null;
    update({ ...chart, seats });
  }

  const unseated = useMemo(() => students.filter((s) => !chart.seats.includes(s)), [students, chart.seats]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader icon={Armchair} title="Seating Chart" description="Color-coded by latest assessment average. Assign seats manually or auto." />

      <Section title="Chart Settings">
        <div className="grid gap-4 md:grid-cols-4">
          <Field label="Class"><select className="input" value={klass} onChange={(e) => setKlass(e.target.value)}>{CLASSES.map((c) => <option key={c}>{c}</option>)}</select></Field>
          <Field label="Name"><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Rows"><input type="number" min={1} max={10} className="input" value={chart.rows} onChange={(e) => applyGrid(+e.target.value, chart.cols)} /></Field>
          <Field label="Cols"><input type="number" min={1} max={10} className="input" value={chart.cols} onChange={(e) => applyGrid(chart.rows, +e.target.value)} /></Field>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={autoAssign} className="bg-gradient-primary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"><Wand2 className="h-4 w-4" /> Auto-Assign</button>
          <button onClick={shuffle} className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/60 px-4 py-2 text-sm font-semibold"><Shuffle className="h-4 w-4" /> Shuffle</button>
          <button onClick={clear} className="rounded-xl border border-white/40 bg-white/60 px-4 py-2 text-sm font-semibold">Clear</button>
        </div>
      </Section>

      <Section title="Performance Key">
        <div className="flex flex-wrap gap-3 text-xs">
          <Legend tone="mint" label="≥70% Excellent" />
          <Legend tone="amber" label="50–69% Average" />
          <Legend tone="destructive" label="<50% Needs Help" />
        </div>
      </Section>

      <Section title={`Classroom — ${name}`}>
        <div className="overflow-x-auto">
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${chart.cols}, minmax(120px, 1fr))` }}>
            {chart.seats.map((s, i) => {
              const score = s ? chart.scores[s] : undefined;
              return (
                <div key={i} className={`flex h-24 flex-col items-center justify-center rounded-2xl border-2 p-2 text-center text-xs transition ${toneFor(score)}`}>
                  <select className="w-full bg-transparent text-center text-xs font-semibold outline-none" value={s ?? ""} onChange={(e) => assign(i, e.target.value)}>
                    <option value="">— empty —</option>
                    {students.map((st) => <option key={st} value={st}>{st}</option>)}
                  </select>
                  {score !== undefined && <span className="mt-1 text-[10px] opacity-80">{score}%</span>}
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      {unseated.length > 0 && (
        <Section title={`Unseated (${unseated.length})`}>
          <div className="flex flex-wrap gap-2">
            {unseated.map((s) => (
              <span key={s} className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1 text-xs"><Plus className="h-3 w-3" /> {s}</span>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>{children}</label>;
}
function Legend({ tone, label }: { tone: "mint" | "amber" | "destructive"; label: string }) {
  const map = { mint: "bg-mint", amber: "bg-amber", destructive: "bg-destructive" };
  return <span className="inline-flex items-center gap-2"><span className={`h-3 w-3 rounded-full ${map[tone]}`} /> {label}</span>;
}
