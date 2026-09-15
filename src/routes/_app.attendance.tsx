import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { UserCheck, Download, Check, X, Save } from "lucide-react";
import { PageHeader, Section } from "@/components/page-header";
import { CLASSES, TERMS, studentsFor } from "@/lib/sample-data";
import { usePersisted } from "@/hooks/use-persisted";

export const Route = createFileRoute("/_app/attendance")({
  head: () => ({ meta: [{ title: "Attendance — SchlarOS" }] }),
  component: AttendancePage,
});

type Status = "P" | "A" | "L" | "";
type DayRecord = Record<string, Status>;
type Store = Record<string, Record<string, DayRecord>>; // class -> date -> studentRecord

function AttendancePage() {
  const [klass, setKlass] = useState(CLASSES[0]);
  const [term, setTerm] = useState(TERMS[0]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [store, setStore] = usePersisted<Store>("tg.attendance", {});

  const students = studentsFor(klass);
  const record: DayRecord =
    store[klass]?.[date] ?? Object.fromEntries(students.map((s) => [s, ""]));

  function set(student: string, status: Status) {
    setStore({
      ...store,
      [klass]: { ...(store[klass] ?? {}), [date]: { ...record, [student]: status } },
    });
  }
  function setAll(status: Status) {
    const next = Object.fromEntries(students.map((s) => [s, status]));
    setStore({ ...store, [klass]: { ...(store[klass] ?? {}), [date]: next } });
  }

  const present = students.filter((s) => record[s] === "P").length;
  const absent = students.filter((s) => record[s] === "A").length;
  const late = students.filter((s) => record[s] === "L").length;

  function exportCSV() {
    const rows = [
      ["Date", "Class", "Term", "Student", "Status"],
      ...students.map((s) => [date, klass, term, s, record[s] || ""]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `attendance-${klass}-${date}.csv`;
    a.click();
  }

  // term summary
  const termSummary = useMemo(() => {
    const map = new Map<string, { p: number; a: number; l: number; total: number }>();
    students.forEach((s) => map.set(s, { p: 0, a: 0, l: 0, total: 0 }));
    Object.values(store[klass] ?? {}).forEach((day) => {
      Object.entries(day).forEach(([s, st]) => {
        const v = map.get(s);
        if (!v || !st) return;
        v.total++;
        if (st === "P") v.p++;
        else if (st === "A") v.a++;
        else if (st === "L") v.l++;
      });
    });
    return map;
  }, [store, klass, students]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        icon={UserCheck}
        title="Attendance Tracker"
        description="Daily register, calendar view, and term report."
        actions={
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/60 px-4 py-2 text-sm font-semibold"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        }
      />

      <Section title="Register Settings">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Class">
            <select className="input" value={klass} onChange={(e) => setKlass(e.target.value)}>
              {CLASSES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Term">
            <select className="input" value={term} onChange={(e) => setTerm(e.target.value)}>
              {TERMS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Date">
            <input
              type="date"
              className="input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Field>
        </div>
      </Section>

      <Section
        title={`Class Register — ${date}`}
        action={
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setAll("P")}
              className="rounded-lg bg-mint px-3 py-1.5 text-xs font-semibold text-white"
            >
              <Check className="mr-1 inline h-3.5 w-3.5" />
              All Present
            </button>
            <button
              onClick={() => setAll("A")}
              className="rounded-lg bg-destructive px-3 py-1.5 text-xs font-semibold text-white"
            >
              <X className="mr-1 inline h-3.5 w-3.5" />
              All Absent
            </button>
          </div>
        }
      >
        <div className="mb-4 grid grid-cols-3 gap-3 text-center text-sm">
          <Stat label="Present" value={present} tone="mint" />
          <Stat label="Absent" value={absent} tone="destructive" />
          <Stat label="Late" value={late} tone="amber" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/40 text-left text-xs text-muted-foreground">
                <th className="py-2">#</th>
                <th>Student</th>
                <th className="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={s} className="border-b border-white/20">
                  <td className="py-2 text-muted-foreground">{i + 1}</td>
                  <td className="py-2 font-medium">{s}</td>
                  <td className="py-2 text-center">
                    <div className="inline-flex gap-1">
                      {(["P", "A", "L"] as Status[]).map((st) => (
                        <button
                          key={st}
                          onClick={() => set(s, st)}
                          className={`h-8 w-8 rounded-lg text-xs font-bold transition ${record[s] === st ? (st === "P" ? "bg-mint text-white" : st === "A" ? "bg-destructive text-white" : "bg-amber text-white") : "bg-white/60 hover:bg-white"}`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-end">
          <button className="bg-gradient-primary glow-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white">
            <Save className="h-4 w-4" /> Saved Automatically
          </button>
        </div>
      </Section>

      <Section title={`Term Summary — ${term}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/40 text-left text-xs text-muted-foreground">
                <th className="py-2">Student</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Late</th>
                <th>Days</th>
                <th>Attendance %</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => {
                const v = termSummary.get(s)!;
                const pct = v.total ? Math.round((v.p / v.total) * 100) : 0;
                return (
                  <tr key={s} className="border-b border-white/20">
                    <td className="py-2 font-medium">{s}</td>
                    <td className="text-mint-foreground">{v.p}</td>
                    <td className="text-destructive">{v.a}</td>
                    <td className="text-amber">{v.l}</td>
                    <td>{v.total}</td>
                    <td
                      className={
                        pct >= 75
                          ? "font-semibold text-mint-foreground"
                          : "font-semibold text-destructive"
                      }
                    >
                      {pct}%
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
function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "mint" | "destructive" | "amber";
}) {
  const map = {
    mint: "bg-mint/15 text-mint-foreground",
    destructive: "bg-destructive/15 text-destructive",
    amber: "bg-amber/15 text-amber",
  };
  return (
    <div className={`rounded-2xl p-3 ${map[tone]}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs opacity-80">{label}</div>
    </div>
  );
}
