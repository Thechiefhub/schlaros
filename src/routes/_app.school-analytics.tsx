import { createFileRoute } from "@tanstack/react-router";
import { PieChart } from "lucide-react";
import { PageHeader, Section } from "@/components/page-header";
import { getAssessments, getSubmissions } from "@/lib/store";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_app/school-analytics")({
  head: () => ({ meta: [{ title: "School Analytics — SchlarOS" }] }),
  component: SchoolAnalytics,
});

function SchoolAnalytics() {
  const [stats, setStats] = useState({
    assessments: 0,
    submissions: 0,
    avg: 0,
    pass: 0,
    bySubject: [] as { name: string; count: number }[],
    teachers: 0,
    students: 0,
    classes: 0,
  });

  useEffect(() => {
    const a = getAssessments();
    const s = getSubmissions();
    const scored = s.filter((x) => typeof x.score === "number");
    const avg = scored.length ? Math.round(scored.reduce((t, x) => t + (x.score ?? 0), 0) / scored.length) : 0;
    const pass = scored.length ? Math.round((scored.filter((x) => (x.score ?? 0) >= 50).length / scored.length) * 100) : 0;
    const subjMap = new Map<string, number>();
    a.forEach((x) => subjMap.set(x.subject, (subjMap.get(x.subject) ?? 0) + 1));
    const teachers = JSON.parse(localStorage.getItem("tg.teachers") ?? "[]").length;
    const students = JSON.parse(localStorage.getItem("tg.students") ?? "[]").length;
    const classes = JSON.parse(localStorage.getItem("tg.classes") ?? "[]").length;
    setStats({
      assessments: a.length,
      submissions: s.length,
      avg,
      pass,
      bySubject: [...subjMap.entries()].map(([name, count]) => ({ name, count })),
      teachers,
      students,
      classes,
    });
  }, []);

  const tiles = [
    { label: "Teachers", value: stats.teachers, color: "from-indigo-500 to-violet-500" },
    { label: "Students", value: stats.students, color: "from-emerald-500 to-teal-500" },
    { label: "Classes", value: stats.classes, color: "from-amber-500 to-orange-500" },
    { label: "Assessments", value: stats.assessments, color: "from-cyan-500 to-sky-500" },
    { label: "Submissions", value: stats.submissions, color: "from-rose-500 to-pink-500" },
    { label: "Class Average", value: `${stats.avg}%`, color: "from-fuchsia-500 to-purple-500" },
    { label: "Pass Rate", value: `${stats.pass}%`, color: "from-lime-500 to-emerald-500" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader icon={PieChart} title="School Analytics" description="Whole-school KPIs across teachers, students, assessments, and outcomes." />
      <div className="grid gap-3 md:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className={`glass rounded-2xl p-4`}>
            <div className={`mb-2 inline-block rounded-lg bg-gradient-to-r ${t.color} px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white`}>
              {t.label}
            </div>
            <div className="font-display text-3xl font-bold">{t.value}</div>
          </div>
        ))}
      </div>

      <Section title="Assessments by Subject">
        {stats.bySubject.length === 0 ? (
          <p className="text-sm text-muted-foreground">No assessments yet.</p>
        ) : (
          <ul className="space-y-2">
            {stats.bySubject.map((row) => {
              const pct = Math.min(100, (row.count / Math.max(...stats.bySubject.map((r) => r.count))) * 100);
              return (
                <li key={row.name} className="text-sm">
                  <div className="mb-1 flex justify-between">
                    <span className="font-medium">{row.name}</span>
                    <span className="text-muted-foreground">{row.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/40">
                    <div className="bg-gradient-primary h-full" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Section>
    </div>
  );
}
