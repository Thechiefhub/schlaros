import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { KeyRound, Copy, Download, Plus, MessageSquare, Trash2 } from "lucide-react";
import { PageHeader, Section } from "@/components/page-header";
import { CLASSES, studentsFor } from "@/lib/sample-data";
import { usePersisted } from "@/hooks/use-persisted";

export const Route = createFileRoute("/_app/parent-access")({
  head: () => ({ meta: [{ title: "Parent Access — SchlarOS" }] }),
  component: ParentAccess,
});

type Code = { id: string; student: string; klass: string; code: string; createdAt: string; used: boolean };
type Msg = { id: string; from: string; student: string; body: string; at: string };

function genCode() { return Math.random().toString(36).slice(2, 8).toUpperCase(); }

function ParentAccess() {
  const [tab, setTab] = useState<"all" | "single" | "bulk" | "messages">("all");
  const [codes, setCodes] = usePersisted<Code[]>("tg.parent-codes", []);
  const [msgs, setMsgs] = usePersisted<Msg[]>("tg.parent-msgs", [
    { id: "1", from: "Mrs. Bello", student: "Fatima Bello", body: "Please share this term's calendar.", at: new Date().toISOString() },
  ]);
  const [klass, setKlass] = useState(CLASSES[0]);
  const [student, setStudent] = useState("");

  const portal = (typeof window !== "undefined" ? window.location.origin : "") + "/parent-portal";

  function single() {
    if (!student) return;
    setCodes([{ id: crypto.randomUUID(), student, klass, code: genCode(), createdAt: new Date().toISOString(), used: false }, ...codes]);
    setStudent("");
  }
  function bulk() {
    const fresh = studentsFor(klass).map((s) => ({ id: crypto.randomUUID(), student: s, klass, code: genCode(), createdAt: new Date().toISOString(), used: false }));
    setCodes([...fresh, ...codes]);
  }
  function exportCSV() {
    const rows = [["Student", "Class", "Code", "Created", "Used"], ...codes.map((c) => [c.student, c.klass, c.code, c.createdAt, c.used ? "Yes" : "No"])];
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" }));
    a.download = "parent-codes.csv";
    a.click();
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader icon={KeyRound} title="Parent Access Manager" description="Generate access codes and manage parent messages."
        actions={<>
          <button onClick={() => navigator.clipboard.writeText(portal)} className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/60 px-4 py-2 text-sm font-semibold"><Copy className="h-4 w-4" /> Copy Portal Link</button>
          <button onClick={exportCSV} className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/60 px-4 py-2 text-sm font-semibold"><Download className="h-4 w-4" /> Export Codes</button>
        </>}
      />

      <Section title="Parent Portal URL">
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/40 bg-white/60 p-3 text-sm">
          <span className="truncate text-primary">{portal}</span>
          <button onClick={() => navigator.clipboard.writeText(portal)} className="ml-auto inline-flex items-center gap-1 rounded-lg bg-gradient-primary px-3 py-1.5 text-xs font-semibold text-white"><Copy className="h-3 w-3" /> Copy</button>
        </div>
      </Section>

      <div className="inline-flex rounded-xl bg-white/50 p-1 text-sm">
        {[["all", "All Codes"], ["single", "Single"], ["bulk", "Bulk"], ["messages", "Messages"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k as typeof tab)} className={`rounded-lg px-3 py-1.5 ${tab === k ? "bg-gradient-primary text-white" : ""}`}>{l}</button>
        ))}
      </div>

      {tab === "single" && (
        <Section title="Generate Single Code">
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Class"><select className="input" value={klass} onChange={(e) => setKlass(e.target.value)}>{CLASSES.map((c) => <option key={c}>{c}</option>)}</select></Field>
            <Field label="Student"><select className="input" value={student} onChange={(e) => setStudent(e.target.value)}><option value="">Select…</option>{studentsFor(klass).map((s) => <option key={s}>{s}</option>)}</select></Field>
            <div className="flex items-end"><button onClick={single} className="bg-gradient-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"><Plus className="h-4 w-4" /> Generate</button></div>
          </div>
        </Section>
      )}

      {tab === "bulk" && (
        <Section title="Bulk Generate by Class">
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Class"><select className="input" value={klass} onChange={(e) => setKlass(e.target.value)}>{CLASSES.map((c) => <option key={c}>{c}</option>)}</select></Field>
            <div className="flex items-end md:col-span-2"><button onClick={bulk} className="bg-gradient-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"><Plus className="h-4 w-4" /> Generate for {studentsFor(klass).length} Students</button></div>
          </div>
        </Section>
      )}

      {(tab === "all" || tab === "single" || tab === "bulk") && (
        <Section title={`Access Codes (${codes.length})`}>
          {codes.length === 0 ? <p className="text-sm text-muted-foreground">No codes yet.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-white/40 text-left text-xs text-muted-foreground"><th className="py-2">Student</th><th>Class</th><th>Code</th><th>Created</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {codes.map((c) => (
                    <tr key={c.id} className="border-b border-white/20">
                      <td className="py-2 font-medium">{c.student}</td>
                      <td>{c.klass}</td>
                      <td><code className="rounded bg-primary/10 px-2 py-0.5 font-mono text-primary">{c.code}</code></td>
                      <td className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td>{c.used ? <span className="text-mint-foreground">Used</span> : <span className="text-amber">Pending</span>}</td>
                      <td><button onClick={() => setCodes(codes.filter((x) => x.id !== c.id))} className="text-destructive"><Trash2 className="h-4 w-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      )}

      {tab === "messages" && (
        <Section title={`Parent Messages (${msgs.length})`}>
          {msgs.length === 0 ? <p className="text-sm text-muted-foreground">No messages yet.</p> : (
            <ul className="space-y-3">
              {msgs.map((m) => (
                <li key={m.id} className="flex gap-3 rounded-2xl border border-white/40 bg-white/60 p-3">
                  <div className="bg-gradient-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white"><MessageSquare className="h-4 w-4" /></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between"><div className="text-sm font-semibold">{m.from} <span className="text-xs font-normal text-muted-foreground">re: {m.student}</span></div><div className="text-xs text-muted-foreground">{new Date(m.at).toLocaleString()}</div></div>
                    <p className="text-sm">{m.body}</p>
                  </div>
                  <button onClick={() => setMsgs(msgs.filter((x) => x.id !== m.id))} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>{children}</label>;
}
