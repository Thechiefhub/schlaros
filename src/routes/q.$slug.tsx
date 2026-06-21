import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Sparkles, CheckCircle2, XCircle, Trophy, Clock, ArrowRight } from "lucide-react";
import { CLASSES } from "@/lib/sample-data";
import { addSubmission, getAssessmentBySlug, gradeMCQ, isMCQ, type Assessment, type Submission } from "@/lib/store";

export const Route = createFileRoute("/q/$slug")({
  head: ({ params }) => ({ meta: [{ title: `Assessment · ${params.slug} — TeacherGPT` }] }),
  component: PublicAssessment,
});

type Phase = "landing" | "attempt" | "result";

function PublicAssessment() {
  const { slug } = Route.useParams();
  const [assessment, setAssessment] = useState<Assessment | null | undefined>(undefined);
  const [phase, setPhase] = useState<Phase>("landing");
  const [student, setStudent] = useState({ name: "", email: "", klass: CLASSES[0] });
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<{ submission: Submission; score: number; correct: number; total: number } | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    setAssessment(getAssessmentBySlug(slug) ?? null);
  }, [slug]);

  useEffect(() => {
    if (phase !== "attempt") return;
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const mcq = useMemo(() => (assessment ? isMCQ(assessment) : false), [assessment]);

  if (assessment === undefined) return <Centered>Loading assessment…</Centered>;
  if (assessment === null) {
    return (
      <Centered>
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold">Assessment not found</h1>
          <p className="mt-2 text-muted-foreground">
            This link may have expired or been removed. Please contact your teacher.
          </p>
          <Link to="/" className="bg-gradient-primary mt-6 inline-flex rounded-xl px-5 py-2.5 text-sm font-semibold text-white">
            Back to home
          </Link>
        </div>
      </Centered>
    );
  }

  function start() {
    if (!student.name.trim() || !assessment) return;
    setAnswers(new Array(assessment.questions.length).fill(""));
    setPhase("attempt");
  }

  function submit() {
    if (!assessment) return;
    const total = assessment.questions.length;
    let score: number | undefined;
    let correct = 0;
    if (mcq) {
      const g = gradeMCQ(assessment, answers);
      score = g.score;
      correct = g.correctCount;
    }
    const sub: Submission = {
      id: crypto.randomUUID(),
      assessmentId: assessment.id,
      assessmentTitle: assessment.title,
      klass: student.klass,
      subject: assessment.subject,
      studentName: student.name.trim(),
      studentEmail: student.email.trim() || undefined,
      studentClass: student.klass,
      answers,
      score,
      maxScore: 100,
      autoGraded: mcq,
      needsReview: !mcq,
      submittedAt: new Date().toISOString(),
    };
    addSubmission(sub);
    setResult({ submission: sub, score: score ?? 0, correct, total });
    setPhase("result");
  }

  const minutes = Math.floor(elapsed / 60);
  const seconds = String(elapsed % 60).padStart(2, "0");

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50">
      <header className="border-b border-white/40 bg-white/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-gradient-primary flex h-9 w-9 items-center justify-center rounded-xl">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-lg font-bold">TeacherGPT</span>
          </Link>
          {phase === "attempt" && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-muted-foreground shadow-sm">
              <Clock className="h-3.5 w-3.5" /> {minutes}:{seconds}
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        <AnimatePresence mode="wait">
          {phase === "landing" && (
            <motion.section
              key="landing"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="glass rounded-3xl border border-white/40 p-8 shadow-xl"
            >
              <div className="mb-6 text-center">
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <Sparkles className="h-3 w-3" /> {assessment.subject} · {assessment.klass}
                </span>
                <h1 className="text-gradient-primary mt-4 font-display text-4xl font-bold">{assessment.title}</h1>
                <p className="mt-2 text-muted-foreground">
                  {assessment.questions.length} questions · {assessment.duration ?? 30} minutes ·{" "}
                  {mcq ? "Auto-graded MCQ" : "Theory — graded by teacher"}
                </p>
              </div>

              <div className="space-y-4">
                <Field label="Full Name *">
                  <input
                    className="input"
                    value={student.name}
                    onChange={(e) => setStudent({ ...student, name: e.target.value })}
                    placeholder="e.g. Chinemerem Okeke"
                  />
                </Field>
                <Field label="Email (optional)">
                  <input
                    type="email"
                    className="input"
                    value={student.email}
                    onChange={(e) => setStudent({ ...student, email: e.target.value })}
                    placeholder="you@example.com"
                  />
                </Field>
                <Field label="Class *">
                  <select className="input" value={student.klass} onChange={(e) => setStudent({ ...student, klass: e.target.value })}>
                    {CLASSES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="mt-6 rounded-2xl bg-amber-50/80 p-4 text-xs text-amber-900">
                ⚠️ Please answer all questions honestly. Once submitted, your responses cannot be changed.
              </div>

              <button
                disabled={!student.name.trim()}
                onClick={start}
                className="bg-gradient-primary glow-primary mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                Start Assessment <ArrowRight className="h-4 w-4" />
              </button>
            </motion.section>
          )}

          {phase === "attempt" && (
            <motion.section
              key="attempt"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-4"
            >
              <div className="glass rounded-2xl p-4 text-sm">
                <span className="font-semibold">{student.name}</span> · {student.klass}
              </div>
              {assessment.questions.map((q, i) => (
                <div key={i} className="glass rounded-2xl border border-white/40 p-5">
                  <p className="mb-3 font-semibold">
                    <span className="text-primary">{i + 1}.</span> {q.q}
                  </p>
                  {q.options ? (
                    <div className="grid gap-2">
                      {q.options.map((o) => (
                        <label
                          key={o}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition ${
                            answers[i] === o ? "border-primary bg-primary/5 font-semibold" : "border-white/40 bg-white/50 hover:bg-white/80"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`q-${i}`}
                            checked={answers[i] === o}
                            onChange={() => {
                              const next = [...answers];
                              next[i] = o;
                              setAnswers(next);
                            }}
                            className="h-4 w-4 accent-primary"
                          />
                          {o}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <textarea
                      rows={4}
                      className="input"
                      value={answers[i] ?? ""}
                      onChange={(e) => {
                        const next = [...answers];
                        next[i] = e.target.value;
                        setAnswers(next);
                      }}
                      placeholder="Write your answer here…"
                    />
                  )}
                </div>
              ))}
              <button
                onClick={submit}
                className="bg-gradient-primary glow-primary inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white"
              >
                Submit Assessment
              </button>
            </motion.section>
          )}

          {phase === "result" && result && (
            <motion.section
              key="result"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-3xl border border-white/40 p-8 text-center shadow-xl"
            >
              {mcq ? (
                <>
                  <div className="bg-gradient-primary mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl">
                    <Trophy className="h-10 w-10 text-white" />
                  </div>
                  <h1 className="text-gradient-primary font-display text-5xl font-bold">{result.score}%</h1>
                  <p className="mt-2 text-muted-foreground">
                    You got <span className="font-semibold text-foreground">{result.correct}</span> of {result.total} correct
                  </p>

                  <div className="mt-8 space-y-3 text-left">
                    <h2 className="font-display text-lg font-semibold">Corrections</h2>
                    {assessment.questions.map((q, i) => {
                      const userA = result.submission.answers[i] ?? "";
                      const ok = (userA ?? "").trim() === (q.answer ?? "").trim();
                      return (
                        <div key={i} className={`rounded-2xl border p-4 text-sm ${ok ? "border-emerald-300 bg-emerald-50/50" : "border-rose-300 bg-rose-50/50"}`}>
                          <div className="flex items-start gap-2">
                            {ok ? (
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                            ) : (
                              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
                            )}
                            <div className="flex-1">
                              <p className="font-medium">
                                {i + 1}. {q.q}
                              </p>
                              <p className="mt-1 text-xs">
                                Your answer: <span className={ok ? "font-semibold text-emerald-700" : "font-semibold text-rose-700"}>{userA || "—"}</span>
                              </p>
                              {!ok && (
                                <p className="text-xs">
                                  Correct: <span className="font-semibold text-emerald-700">{q.answer}</span>
                                </p>
                              )}
                              {q.explanation && <p className="mt-1 text-xs text-muted-foreground">💡 {q.explanation}</p>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-gradient-primary mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl">
                    <CheckCircle2 className="h-10 w-10 text-white" />
                  </div>
                  <h1 className="text-gradient-primary font-display text-3xl font-bold">Submission received</h1>
                  <p className="mt-2 text-muted-foreground">
                    Your answers have been recorded. Your teacher will grade your responses shortly.
                  </p>
                </>
              )}
              <Link to="/" className="mt-8 inline-flex rounded-xl border border-white/40 bg-white/60 px-5 py-2.5 text-sm font-semibold">
                Done
              </Link>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
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

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen items-center justify-center p-6">{children}</div>;
}
