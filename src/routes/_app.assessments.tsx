import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ClipboardList, Sparkles, Loader2, Download, Share2, Copy, Check, ExternalLink, Trash2 } from "lucide-react";
import { PageHeader, Section } from "@/components/page-header";
import { CLASSES, SUBJECTS } from "@/lib/sample-data";
import { generateAI } from "@/lib/ai.functions";
import {
  getAssessments,
  saveAssessments,
  shareUrl,
  uniqueSlug,
  type Assessment,
  type Question,
} from "@/lib/store";
import { useEffect } from "react";

export const Route = createFileRoute("/_app/assessments")({
  head: () => ({ meta: [{ title: "Assessments — TeacherGPT" }] }),
  component: AssessmentsPage,
});

function AssessmentsPage() {
  const [mode, setMode] = useState<"single" | "multi">("single");
  const [title, setTitle] = useState("");
  const [qType, setQType] = useState("Multiple Choice");
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [klass, setKlass] = useState(CLASSES[0]);
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState("Medium");
  const [time, setTime] = useState(30);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [saved, setSaved] = useState<Assessment[]>([]);
  const [current, setCurrent] = useState<Question[] | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setSaved(getAssessments());
  }, []);

  async function generate() {
    setErr("");
    setLoading(true);
    setCurrent(null);
    try {
      const sys = "You are an expert curriculum designer. Return strictly valid JSON.";
      const prompt = `Create ${count} ${difficulty.toLowerCase()} ${qType} questions for ${klass} ${subject} on the topic "${topic}". Return JSON of shape: {"questions":[{"q":"...","options":["A","B","C","D"],"answer":"A","explanation":"..."}]}. For non-multiple-choice, omit "options" entirely. Keep explanations short.`;
      const res = await generateAI({ data: { system: sys, prompt, json: true } });
      const obj = JSON.parse(res.json) as { questions: Question[] };
      setCurrent(obj.questions ?? []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  function save() {
    if (!current) return;
    const t = title || `${subject} · ${topic}`;
    const a: Assessment = {
      id: crypto.randomUUID(),
      slug: uniqueSlug(t),
      title: t,
      subject,
      klass,
      topic,
      type: qType,
      duration: time,
      questions: current,
      createdAt: new Date().toISOString(),
    };
    const next = [a, ...saved];
    setSaved(next);
    saveAssessments(next);
    setCurrent(null);
    setTitle("");
    setTopic("");
  }

  function remove(id: string) {
    const next = saved.filter((a) => a.id !== id);
    setSaved(next);
    saveAssessments(next);
  }

  function exportJSON() {
    if (!current) return;
    const blob = new Blob([JSON.stringify({ title, subject, klass, topic, questions: current }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(title || "assessment").replace(/\s+/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copyLink(a: Assessment) {
    await navigator.clipboard.writeText(shareUrl(`/q/${a.slug}`));
    setCopiedId(a.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader icon={ClipboardList} title="Create Assessment" description="AI-generated quizzes — share a link, auto-grade MCQs, collect theory submissions." />

      <Section
        title="Assessment Setup"
        action={
          <div className="inline-flex rounded-xl bg-white/50 p-1 text-sm">
            <button onClick={() => setMode("single")} className={`rounded-lg px-3 py-1.5 ${mode === "single" ? "bg-gradient-primary text-white" : ""}`}>Single Subject</button>
            <button onClick={() => setMode("multi")} className={`rounded-lg px-3 py-1.5 ${mode === "multi" ? "bg-gradient-primary text-white" : ""}`}>Multi-Subject</button>
          </div>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Title"><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Mid-term Quiz" /></Field>
          <Field label="Question Type">
            <select className="input" value={qType} onChange={(e) => setQType(e.target.value)}>
              {["Multiple Choice", "True / False", "Short Answer", "Essay"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Subject *">
            <select className="input" value={subject} onChange={(e) => setSubject(e.target.value)}>
              {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Class *">
            <select className="input" value={klass} onChange={(e) => setKlass(e.target.value)}>
              {CLASSES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Topic *"><input className="input" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Fractions, Photosynthesis…" /></Field>
          <Field label="Number of Questions"><input type="number" min={1} max={50} className="input" value={count} onChange={(e) => setCount(+e.target.value)} /></Field>
          <Field label="Difficulty">
            <select className="input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              {["Easy", "Medium", "Hard"].map((d) => <option key={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="Time Limit (minutes)"><input type="number" min={5} className="input" value={time} onChange={(e) => setTime(+e.target.value)} /></Field>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button disabled={!topic || loading} onClick={generate} className="bg-gradient-primary glow-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Generate Assessment
          </button>
          {current && (
            <>
              <button onClick={save} className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600">
                Save &amp; create share link
              </button>
              <button onClick={exportJSON} className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/60 px-4 py-2.5 text-sm font-semibold"><Download className="h-4 w-4" /> Export</button>
            </>
          )}
        </div>
        {err && <p className="mt-3 text-sm text-destructive">{err}</p>}
      </Section>

      {current && (
        <Section title={`Generated Questions (${current.length})`}>
          <ol className="space-y-4">
            {current.map((q, i) => (
              <li key={i} className="rounded-2xl border border-white/40 bg-white/60 p-4">
                <p className="font-medium">{i + 1}. {q.q}</p>
                {q.options && (
                  <ul className="mt-2 grid gap-1.5 text-sm md:grid-cols-2">
                    {q.options.map((o, idx) => (
                      <li key={idx} className={`rounded-lg border px-3 py-1.5 ${o === q.answer ? "border-emerald-400 bg-emerald-50 font-semibold" : "border-white/40"}`}>{o}</li>
                    ))}
                  </ul>
                )}
                {!q.options && <p className="mt-2 text-sm text-muted-foreground"><span className="font-semibold">Answer:</span> {q.answer}</p>}
                {q.explanation && <p className="mt-2 text-xs text-muted-foreground">💡 {q.explanation}</p>}
              </li>
            ))}
          </ol>
        </Section>
      )}

      {saved.length > 0 && (
        <Section title={`Saved Assessments (${saved.length})`}>
          <ul className="space-y-3">
            {saved.map((a) => {
              const link = shareUrl(`/q/${a.slug}`);
              return (
                <li key={a.id} className="rounded-2xl border border-white/40 bg-white/60 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold">{a.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {a.subject} · {a.klass} · {a.questions.length} questions · {a.duration}m · {new Date(a.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={`/q/${a.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg bg-white/80 px-3 py-1.5 text-xs font-semibold"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> Open
                      </a>
                      <button
                        onClick={() => copyLink(a)}
                        className="inline-flex items-center gap-1 rounded-lg bg-gradient-primary px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        {copiedId === a.id ? <Check className="h-3.5 w-3.5" /> : <Share2 className="h-3.5 w-3.5" />}
                        {copiedId === a.id ? "Copied!" : "Share link"}
                      </button>
                      <button
                        onClick={() => remove(a.id)}
                        className="rounded-lg bg-destructive/10 p-1.5 text-destructive"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 truncate rounded-lg bg-slate-900/5 px-3 py-1.5 font-mono text-[11px] text-primary">
                    {link}
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Tip: visit <Link to="/submissions" className="font-semibold text-primary">Submissions</Link> to grade theory answers and review MCQ results.
          </p>
        </Section>
      )}
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
