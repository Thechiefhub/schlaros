import { createFileRoute } from "@tanstack/react-router";
import { Inbox, Search, CheckCircle2, Clock, Edit3, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PageHeader, Section } from "@/components/page-header";
import {
  getAssessments,
  getSubmissions,
  updateSubmission,
  type Submission,
  type Assessment,
} from "@/lib/store";

export const Route = createFileRoute("/_app/submissions")({
  head: () => ({ meta: [{ title: "Submissions — SchlarOS" }] }),
  component: SubmissionsPage,
});

function SubmissionsPage() {
  const [subs, setSubs] = useState<Submission[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "auto" | "pending">("all");
  const [active, setActive] = useState<Submission | null>(null);
  const [score, setScore] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setSubs(getSubmissions());
    setAssessments(getAssessments());
  }, [tick]);

  const filtered = useMemo(() => {
    return subs
      .filter((s) =>
        filter === "auto"
          ? s.autoGraded
          : filter === "pending"
            ? s.needsReview && s.score === undefined
            : true,
      )
      .filter((s) =>
        q
          ? [s.studentName, s.assessmentTitle, s.subject, s.klass]
              .join(" ")
              .toLowerCase()
              .includes(q.toLowerCase())
          : true,
      );
  }, [subs, q, filter]);

  const activeAssessment = active ? assessments.find((a) => a.id === active.assessmentId) : null;

  function saveTheoryGrade() {
    if (!active) return;
    const n = Number(score);
    if (Number.isNaN(n) || n < 0 || n > 100) return;
    updateSubmission(active.id, { score: n, needsReview: false });
    setActive(null);
    setScore("");
    setTick((x) => x + 1);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        icon={Inbox}
        title="Submissions"
        description="All MCQ and theory submissions — auto-graded results posted to the score sheet."
      />

      <Section
        title={`Submissions (${filtered.length})`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                className="input pl-8"
                placeholder="Search student or assessment…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <div className="inline-flex rounded-xl bg-white/50 p-1 text-xs">
              {(["all", "auto", "pending"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setFilter(k)}
                  className={`rounded-lg px-3 py-1.5 capitalize ${filter === k ? "bg-gradient-primary text-white" : "text-muted-foreground"}`}
                >
                  {k === "pending" ? "Needs grading" : k === "auto" ? "Auto-graded" : "All"}
                </button>
              ))}
            </div>
          </div>
        }
      >
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No submissions yet. Share an assessment link with your students.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr className="border-b border-white/30">
                  <th className="py-2 pr-3 font-semibold">Student</th>
                  <th className="py-2 pr-3 font-semibold">Assessment</th>
                  <th className="py-2 pr-3 font-semibold">Class</th>
                  <th className="py-2 pr-3 font-semibold">Submitted</th>
                  <th className="py-2 pr-3 font-semibold">Score</th>
                  <th className="py-2 pr-3 font-semibold">Status</th>
                  <th className="py-2 pr-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-b border-white/20">
                    <td className="py-2 pr-3 font-semibold">{s.studentName}</td>
                    <td className="py-2 pr-3">{s.assessmentTitle}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{s.klass}</td>
                    <td className="py-2 pr-3 text-xs text-muted-foreground">
                      {new Date(s.submittedAt).toLocaleString()}
                    </td>
                    <td className="py-2 pr-3 font-bold">
                      {typeof s.score === "number" ? `${s.score}%` : "—"}
                    </td>
                    <td className="py-2 pr-3">
                      {s.autoGraded ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" /> Auto
                        </span>
                      ) : s.score === undefined ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                          <Clock className="h-3 w-3" /> Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                          <CheckCircle2 className="h-3 w-3" /> Graded
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-right">
                      <button
                        onClick={() => {
                          setActive(s);
                          setScore(typeof s.score === "number" ? String(s.score) : "");
                        }}
                        className="rounded-lg bg-white/70 px-3 py-1 text-xs font-semibold"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={() => setActive(null)}
        >
          <div
            className="glass max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="font-display text-xl font-bold">{active.studentName}</h3>
                <p className="text-sm text-muted-foreground">
                  {active.assessmentTitle} · {active.klass} · {active.subject}
                </p>
              </div>
              {typeof active.score === "number" && (
                <div className="text-gradient-primary font-display text-3xl font-bold">
                  {active.score}%
                </div>
              )}
            </div>
            {activeAssessment ? (
              <ol className="space-y-3">
                {activeAssessment.questions.map((q, i) => {
                  const a = active.answers[i] ?? "";
                  const ok = q.options ? a.trim() === q.answer.trim() : null;
                  return (
                    <li
                      key={i}
                      className={`rounded-2xl border p-3 text-sm ${
                        ok === true
                          ? "border-emerald-300 bg-emerald-50/50"
                          : ok === false
                            ? "border-rose-300 bg-rose-50/50"
                            : "border-white/40 bg-white/50"
                      }`}
                    >
                      <p className="font-medium">
                        {i + 1}. {q.q}
                      </p>
                      <p className="mt-1 text-xs">
                        <span className="text-muted-foreground">Answer:</span>{" "}
                        <span className="font-semibold">{a || "—"}</span>
                      </p>
                      {q.options && ok === false && (
                        <p className="text-xs">
                          <span className="text-muted-foreground">Correct:</span>{" "}
                          <span className="font-semibold text-emerald-700">{q.answer}</span>
                        </p>
                      )}
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground">Assessment data not found.</p>
            )}

            {!active.autoGraded && (
              <div className="mt-5 flex items-center gap-2 rounded-2xl bg-amber-50/80 p-3">
                <Edit3 className="h-4 w-4 text-amber-700" />
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="input flex-1"
                  placeholder="Score (0–100)"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                />
                <button
                  onClick={saveTheoryGrade}
                  className="bg-gradient-primary inline-flex items-center gap-1 rounded-xl px-4 py-2 text-xs font-semibold text-white"
                >
                  <Save className="h-3.5 w-3.5" /> Save grade
                </button>
              </div>
            )}

            <div className="mt-4 text-right">
              <button
                onClick={() => setActive(null)}
                className="rounded-xl border border-white/40 bg-white/60 px-4 py-2 text-sm font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
