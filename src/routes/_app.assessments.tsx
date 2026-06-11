import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ClipboardList, Sparkles, Loader2, Download } from "lucide-react";
import { PageHeader, Section } from "@/components/page-header";
import { CLASSES, SUBJECTS } from "@/lib/sample-data";
import { generateAI } from "@/lib/ai.functions";
import { usePersisted } from "@/hooks/use-persisted";

export const Route = createFileRoute("/_app/assessments")({
  head: () => ({ meta: [{ title: "Assessments — TeacherGPT" }] }),
  component: AssessmentsPage,
});

type Question = { q: string; options?: string[]; answer: string; explanation?: string };

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
  const [saved, setSaved] = usePersisted<{ title: string; questions: Question[]; createdAt: string }[]>("tg.assessments", []);
  const [current, setCurrent] = useState<Question[] | null>(null);

  async function generate() {
    setErr("");
    setLoading(true);
    setCurrent(null);
    try {
      const sys = "You are an expert curriculum designer. Return strictly valid JSON.";
      const prompt = `Create ${count} ${difficulty.toLowerCase()} ${qType} questions for ${klass} ${subject} on the topic "${topic}". Return JSON of shape: {"questions":[{"q":"...","options":["A","B","C","D"],"answer":"A","explanation":"..."}]}. For non-multiple-choice, omit options. Keep explanations short.`;
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
    setSaved([{ title: title || `${subject} - ${topic}`, questions: current, createdAt: new Date().toISOString() }, ...saved]);
    setCurrent(null);
    setTitle("");
    setTopic("");
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

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader icon={ClipboardList} title="Create Assessment" description="AI-generated quizzes, tests, and exams." />

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
              <button onClick={save} className="rounded-xl bg-mint px-5 py-2.5 text-sm font-semibold text-white">Save</button>
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
                      <li key={idx} className={`rounded-lg border px-3 py-1.5 ${o === q.answer ? "border-mint bg-mint/10 font-semibold" : "border-white/40"}`}>{o}</li>
                    ))}
                  </ul>
                )}
                {!q.options && <p className="mt-2 text-sm text-mint-foreground/80"><span className="font-semibold">Answer:</span> {q.answer}</p>}
                {q.explanation && <p className="mt-2 text-xs text-muted-foreground">💡 {q.explanation}</p>}
              </li>
            ))}
          </ol>
        </Section>
      )}

      {saved.length > 0 && (
        <Section title={`Saved Assessments (${saved.length})`}>
          <ul className="divide-y divide-white/30">
            {saved.map((a, i) => (
              <li key={i} className="flex items-center justify-between py-2 text-sm">
                <div><div className="font-medium">{a.title}</div><div className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleString()} • {a.questions.length} questions</div></div>
                <button onClick={() => setSaved(saved.filter((_, j) => j !== i))} className="text-xs text-destructive">Delete</button>
              </li>
            ))}
          </ul>
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
