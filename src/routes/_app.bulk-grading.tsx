import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckSquare, Sparkles, Loader2 } from "lucide-react";
import { PageHeader, Section } from "@/components/page-header";
import { studentsFor, CLASSES } from "@/lib/sample-data";
import { usePersisted } from "@/hooks/use-persisted";
import { generateAI } from "@/lib/ai.functions";

export const Route = createFileRoute("/_app/bulk-grading")({
  head: () => ({ meta: [{ title: "Bulk Grading — SchlarOS" }] }),
  component: BulkGrading,
});

type Row = { student: string; score: number; max: number; feedback: string };

function BulkGrading() {
  const [klass, setKlass] = useState(CLASSES[0]);
  const [assessment, setAssessment] = useState("Mid-term Quiz");
  const [max, setMax] = useState(100);
  const [rows, setRows] = usePersisted<Record<string, Row[]>>("tg.bulk-grading", {});
  const [loadingFor, setLoadingFor] = useState<string | null>(null);

  const key = `${klass}::${assessment}`;
  const current: Row[] =
    rows[key] ?? studentsFor(klass).map((s) => ({ student: s, score: 0, max, feedback: "" }));

  function update(idx: number, patch: Partial<Row>) {
    const next = current.map((r, i) => (i === idx ? { ...r, ...patch } : r));
    setRows({ ...rows, [key]: next });
  }

  const avg = useMemo(
    () =>
      current.length
        ? Math.round(current.reduce((a, r) => a + (r.score / r.max) * 100, 0) / current.length)
        : 0,
    [current],
  );

  async function aiFeedback(idx: number) {
    const r = current[idx];
    setLoadingFor(r.student);
    try {
      const res = await generateAI({
        data: {
          system:
            "You are a kind, constructive teacher. Reply with ONE short feedback sentence (max 24 words).",
          prompt: `Student ${r.student} scored ${r.score}/${r.max} on "${assessment}". Give actionable, encouraging feedback.`,
        },
      });
      update(idx, { feedback: res.text.trim() });
    } finally {
      setLoadingFor(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        icon={CheckSquare}
        title="Bulk Grading"
        description="Review and grade all student submissions for an assessment."
      />
      <Section title="Select Assessment">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Class">
            <select className="input" value={klass} onChange={(e) => setKlass(e.target.value)}>
              {CLASSES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Assessment">
            <input
              className="input"
              value={assessment}
              onChange={(e) => setAssessment(e.target.value)}
            />
          </Field>
          <Field label="Max Score">
            <input
              type="number"
              className="input"
              value={max}
              onChange={(e) => setMax(+e.target.value)}
            />
          </Field>
        </div>
      </Section>

      <Section title={`Submissions (${current.length}) — Avg ${avg}%`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/40 text-left text-xs text-muted-foreground">
                <th className="py-2">Student</th>
                <th>Score</th>
                <th>%</th>
                <th>Feedback</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {current.map((r, i) => {
                const pct = Math.round((r.score / r.max) * 100);
                return (
                  <tr key={r.student} className="border-b border-white/20 align-top">
                    <td className="py-2 font-medium">{r.student}</td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        max={r.max}
                        className="input w-20"
                        value={r.score}
                        onChange={(e) => update(i, { score: +e.target.value })}
                      />
                    </td>
                    <td
                      className={
                        pct >= 50
                          ? "font-semibold text-mint-foreground"
                          : "font-semibold text-destructive"
                      }
                    >
                      {pct}%
                    </td>
                    <td>
                      <textarea
                        rows={2}
                        className="input min-w-[220px]"
                        value={r.feedback}
                        onChange={(e) => update(i, { feedback: e.target.value })}
                        placeholder="Comment…"
                      />
                    </td>
                    <td>
                      <button
                        onClick={() => aiFeedback(i)}
                        disabled={loadingFor === r.student}
                        className="bg-gradient-primary inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        {loadingFor === r.student ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Sparkles className="h-3 w-3" />
                        )}{" "}
                        AI
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
