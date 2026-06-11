import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Grid3x3, Download } from "lucide-react";
import { PageHeader, Section } from "@/components/page-header";
import { CLASSES, SUBJECTS, studentsFor } from "@/lib/sample-data";
import { usePersisted } from "@/hooks/use-persisted";

export const Route = createFileRoute("/_app/grade-grid")({
  head: () => ({ meta: [{ title: "Grade Grid — TeacherGPT" }] }),
  component: GradeGrid,
});

type Grid = Record<string, Record<string, Record<string, number>>>; // class -> student -> subject -> score

function seed(klass: string): Record<string, Record<string, number>> {
  const out: Record<string, Record<string, number>> = {};
  studentsFor(klass).forEach((s, i) => {
    out[s] = {};
    SUBJECTS.slice(0, 6).forEach((sub, j) => {
      out[s][sub] = Math.max(30, Math.min(98, 55 + ((i * 7 + j * 13) % 45)));
    });
  });
  return out;
}

function GradeGrid() {
  const [klass, setKlass] = useState(CLASSES[0]);
  const [grid, setGrid] = usePersisted<Grid>("tg.grade-grid", {});
  const subjects = SUBJECTS.slice(0, 6);
  const data = grid[klass] ?? seed(klass);

  function set(student: string, subject: string, value: number) {
    const next = { ...grid, [klass]: { ...data, [student]: { ...data[student], [subject]: value } } };
    setGrid(next);
  }

  const avg = useMemo(() => {
    const out: Record<string, number> = {};
    Object.entries(data).forEach(([s, subs]) => {
      const vals = Object.values(subs);
      out[s] = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
    });
    return out;
  }, [data]);

  function exportCSV() {
    const rows = [["Student", ...subjects, "Average"], ...Object.entries(data).map(([s, subs]) => [s, ...subjects.map((sub) => subs[sub] ?? ""), avg[s]])];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `grade-grid-${klass}.csv`;
    a.click();
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader icon={Grid3x3} title="Grade Grid" description="Unified class grade overview — editable, failing scores highlighted in red."
        actions={<button onClick={exportCSV} className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/60 px-4 py-2 text-sm font-semibold"><Download className="h-4 w-4" /> Export</button>}
      />
      <Section title="Select Class">
        <select className="input max-w-xs" value={klass} onChange={(e) => setKlass(e.target.value)}>
          {CLASSES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </Section>

      <Section title={`Grade Grid — ${klass}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/40 text-left text-xs text-muted-foreground"><th className="py-2 pr-2">Student</th>{subjects.map((s) => <th key={s} className="px-2 text-center">{s}</th>)}<th className="px-2 text-center">Avg</th></tr></thead>
            <tbody>
              {Object.entries(data).map(([student, subs]) => (
                <tr key={student} className="border-b border-white/20">
                  <td className="py-2 pr-2 font-medium">{student}</td>
                  {subjects.map((sub) => {
                    const v = subs[sub] ?? 0;
                    const fail = v < 50;
                    return (
                      <td key={sub} className="px-1 text-center">
                        <input type="number" min={0} max={100} value={v} onChange={(e) => set(student, sub, Math.max(0, Math.min(100, +e.target.value)))}
                          className={`w-16 rounded-lg border bg-white/70 px-2 py-1 text-center text-sm ${fail ? "border-destructive bg-destructive/10 text-destructive" : "border-white/40"}`} />
                      </td>
                    );
                  })}
                  <td className={`px-2 text-center font-bold ${avg[student] < 50 ? "text-destructive" : "text-mint-foreground"}`}>{avg[student]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}
