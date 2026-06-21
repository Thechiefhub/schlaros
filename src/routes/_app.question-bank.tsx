import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Database, Sparkles, Loader2, Trash2 } from "lucide-react";
import { PageHeader, Section } from "@/components/page-header";
import { SUBJECTS } from "@/lib/sample-data";
import { usePersisted } from "@/hooks/use-persisted";
import { generateAI } from "@/lib/ai.functions";

export const Route = createFileRoute("/_app/question-bank")({
  head: () => ({ meta: [{ title: "Question Bank — SchlarOS" }] }),
  component: QuestionBank,
});

type Q = { id: string; subject: string; topic: string; level: string; q: string; options?: string[]; answer: string };

function QuestionBank() {
  const [bank, setBank] = usePersisted<Q[]>("tg.qbank", []);
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("Medium");
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [filterSub, setFilterSub] = useState("All");
  const [filterLvl, setFilterLvl] = useState("All");

  const filtered = useMemo(() => bank.filter((q) => (filterSub === "All" || q.subject === filterSub) && (filterLvl === "All" || q.level === filterLvl)), [bank, filterSub, filterLvl]);

  async function generate() {
    setErr("");
    setLoading(true);
    try {
      const res = await generateAI({
        data: {
          system: "You are an expert teacher. Return strictly valid JSON.",
          prompt: `Generate ${count} ${level} multiple-choice questions for ${subject} on the topic "${topic}". JSON shape: {"questions":[{"q":"...","options":["..","..","..",".."],"answer":"text of correct option"}]}.`,
          json: true,
        },
      });
      const obj = JSON.parse(res.json) as { questions: { q: string; options: string[]; answer: string }[] };
      const fresh: Q[] = obj.questions.map((q) => ({ id: crypto.randomUUID(), subject, topic, level, ...q }));
      setBank([...fresh, ...bank]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader icon={Database} title="Question Bank" description="Reusable question database organized by subject and topic." />

      <Section title="Generate Questions with AI">
        <div className="grid gap-4 md:grid-cols-4">
          <Field label="Subject"><select className="input" value={subject} onChange={(e) => setSubject(e.target.value)}>{SUBJECTS.map((s) => <option key={s}>{s}</option>)}</select></Field>
          <Field label="Topic"><input className="input" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Algebra" /></Field>
          <Field label="Level"><select className="input" value={level} onChange={(e) => setLevel(e.target.value)}>{["Easy", "Medium", "Hard"].map((l) => <option key={l}>{l}</option>)}</select></Field>
          <Field label="Count"><input type="number" min={1} max={30} className="input" value={count} onChange={(e) => setCount(+e.target.value)} /></Field>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button disabled={!topic || loading} onClick={generate} className="bg-gradient-primary glow-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Generate
          </button>
          {err && <span className="text-sm text-destructive">{err}</span>}
        </div>
      </Section>

      <Section
        title={`Questions (${filtered.length})`}
        action={
          <div className="flex gap-2">
            <select className="input text-xs" value={filterSub} onChange={(e) => setFilterSub(e.target.value)}><option>All</option>{SUBJECTS.map((s) => <option key={s}>{s}</option>)}</select>
            <select className="input text-xs" value={filterLvl} onChange={(e) => setFilterLvl(e.target.value)}><option>All</option>{["Easy", "Medium", "Hard"].map((l) => <option key={l}>{l}</option>)}</select>
          </div>
        }
      >
        {filtered.length === 0 ? <p className="text-sm text-muted-foreground">No questions yet. Build your bank by generating with AI.</p> : (
          <ul className="space-y-3">
            {filtered.map((q) => (
              <li key={q.id} className="rounded-2xl border border-white/40 bg-white/60 p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 font-semibold text-primary">{q.subject}</span>
                  <span className="rounded-full bg-amber/20 px-2 py-0.5 font-semibold text-amber">{q.level}</span>
                  {q.topic && <span className="text-muted-foreground">• {q.topic}</span>}
                  <button onClick={() => setBank(bank.filter((x) => x.id !== q.id))} className="ml-auto text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
                <p className="font-medium">{q.q}</p>
                {q.options && (
                  <ul className="mt-2 grid gap-1.5 text-sm md:grid-cols-2">
                    {q.options.map((o, i) => <li key={i} className={`rounded-lg border px-3 py-1 ${o === q.answer ? "border-mint bg-mint/10 font-semibold" : "border-white/40"}`}>{o}</li>)}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>{children}</label>;
}
