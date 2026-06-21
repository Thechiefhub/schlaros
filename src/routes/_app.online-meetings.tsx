import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Video, Mic, Plus, Copy, Trash2, Calendar } from "lucide-react";
import { PageHeader, Section } from "@/components/page-header";
import { CLASSES, SUBJECTS } from "@/lib/sample-data";
import { usePersisted } from "@/hooks/use-persisted";

export const Route = createFileRoute("/_app/online-meetings")({
  head: () => ({ meta: [{ title: "Online Meetings — TeacherGPT" }] }),
  component: Meetings,
});

type Meeting = { id: string; title: string; agenda: string; klass: string; subject: string; mode: "video" | "audio"; scheduledAt?: string; slug: string };

function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }

function Meetings() {
  const [meetings, setMeetings] = usePersisted<Meeting[]>("tg.meetings", []);
  const [f, setF] = useState<Omit<Meeting, "id" | "slug">>({ title: "", agenda: "", klass: CLASSES[0], subject: SUBJECTS[0], mode: "video", scheduledAt: "" });

  function create() {
    if (!f.title) return;
    const slug = slugify(f.agenda || f.title) || "meeting";
    const m: Meeting = { ...f, id: crypto.randomUUID(), slug: `${slug}-${Math.random().toString(36).slice(2, 6)}` };
    setMeetings([m, ...meetings]);
    setF({ title: "", agenda: "", klass: CLASSES[0], subject: SUBJECTS[0], mode: "video", scheduledAt: "" });
  }

  function link(m: Meeting) {
    if (typeof window === "undefined") return `/m/${m.slug}`;
    const o = window.location.origin;
    const clean = /id-preview|sandbox\.lovable\.dev|--/.test(o) ? "https://schlaros.lovable.app" : o;
    return `${clean}/m/${m.slug}`;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader icon={Video} title="Online Meetings" description="Create classes, share links, run live sessions." />
      <Section title="New Meeting">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Meeting Title *"><input className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
          <Field label="Class"><select className="input" value={f.klass} onChange={(e) => setF({ ...f, klass: e.target.value })}>{CLASSES.map((c) => <option key={c}>{c}</option>)}</select></Field>
          <Field label="Subject"><select className="input" value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })}>{SUBJECTS.map((s) => <option key={s}>{s}</option>)}</select></Field>
          <Field label="Scheduled Time (optional)"><input type="datetime-local" className="input" value={f.scheduledAt} onChange={(e) => setF({ ...f, scheduledAt: e.target.value })} /></Field>
          <Field label="Agenda / Description"><textarea rows={3} className="input" value={f.agenda} onChange={(e) => setF({ ...f, agenda: e.target.value })} placeholder="Used to generate slug URL" /></Field>
          <Field label="Meeting Mode">
            <div className="flex gap-2">
              {(["video", "audio"] as const).map((m) => (
                <button key={m} onClick={() => setF({ ...f, mode: m })} className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold ${f.mode === m ? "bg-gradient-primary border-transparent text-white" : "border-white/40 bg-white/60"}`}>
                  {m === "video" ? <Video className="mr-1 inline h-4 w-4" /> : <Mic className="mr-1 inline h-4 w-4" />}{m === "video" ? "Video + Audio" : "Audio Only"}
                </button>
              ))}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Audio-only recommended for slow networks.</p>
          </Field>
        </div>
        <div className="mt-5">
          <button onClick={create} className="bg-gradient-primary glow-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"><Plus className="h-4 w-4" /> Create &amp; Start Meeting</button>
        </div>
      </Section>

      <Section title={`Meetings (${meetings.length})`}>
        {meetings.length === 0 ? <p className="text-sm text-muted-foreground">No meetings yet.</p> : (
          <ul className="space-y-3">
            {meetings.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/40 bg-white/60 p-4">
                <div>
                  <div className="font-semibold">{m.title}</div>
                  <div className="text-xs text-muted-foreground">{m.klass} • {m.subject} • {m.mode === "video" ? "Video" : "Audio"}{m.scheduledAt && <> • <Calendar className="inline h-3 w-3" /> {new Date(m.scheduledAt).toLocaleString()}</>}</div>
                  <div className="mt-1 text-xs text-primary">{link(m)}</div>
                </div>
                <div className="flex gap-2">
                  <a href={`/m/${m.slug}`} target="_blank" rel="noreferrer" className="bg-gradient-primary inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-white">Start</a>
                  <button onClick={() => navigator.clipboard.writeText(link(m))} className="inline-flex items-center gap-1 rounded-lg bg-white/70 px-3 py-1.5 text-xs font-semibold"><Copy className="h-3.5 w-3.5" /> Copy</button>
                  <button onClick={() => setMeetings(meetings.filter((x) => x.id !== m.id))} className="rounded-lg bg-destructive/10 p-1.5 text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
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
