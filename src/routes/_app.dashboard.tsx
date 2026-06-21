import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  FileText, ClipboardList, BookOpen, FolderOpen, Bot, Database,
  ArrowRight, Sparkles, AlertCircle, Calendar,
} from "lucide-react";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — SchlarOS" },
      { name: "description", content: "Your AI-powered teaching command center." },
    ],
  }),
  component: Dashboard,
});

const TEACHER = "Tolulope";

const METRICS = [
  { label: "Lesson Notes", value: 0, icon: FileText, gradient: "from-purple-400 via-pink-400 to-orange-400" },
  { label: "Assessments", value: 0, icon: ClipboardList, gradient: "from-blue-400 to-cyan-300" },
  { label: "Lesson Plans", value: 0, icon: BookOpen, gradient: "from-emerald-400 to-teal-300" },
  { label: "Resources", value: 0, icon: FolderOpen, gradient: "from-amber-400 to-pink-400" },
];

const QUICK_ACTIONS = [
  { label: "Generate Lesson Note", to: "/lesson-notes", icon: FileText, color: "bg-purple-500" },
  { label: "Create Assessment", to: "/assessments", icon: ClipboardList, color: "bg-pink-500" },
  { label: "AI Assistant", to: "/ai-assistant", icon: Bot, color: "bg-cyan-500" },
  { label: "Question Bank", to: "/question-bank", icon: Database, color: "bg-amber-500" },
  { label: "Lesson Plans", to: "/lesson-plans", icon: BookOpen, color: "bg-emerald-500" },
  { label: "Resources", to: "/resources", icon: FolderOpen, color: "bg-rose-500" },
] as const;

const CLASSES = ["JSS 1", "JSS 2", "JSS 3", "SS1", "SS2", "SS3"];
const SUBJECTS = ["Biology", "English Language", "Mathematics", "Multi-Subject"];
const HEATMAP: Record<string, Record<string, number>> = {
  Biology: { SS3: 90 },
  "English Language": { "JSS 1": 62 },
  Mathematics: { "JSS 2": 60 },
  "Multi-Subject": { SS1: 0 },
};

function gradeFor(v: number | undefined) {
  if (v === undefined) return { label: "—", cls: "bg-slate-100 text-slate-400" };
  if (v >= 70) return { label: `${v}% A`, cls: "bg-emerald-100 text-emerald-700" };
  if (v >= 60) return { label: `${v}% B`, cls: "bg-yellow-100 text-yellow-700" };
  if (v >= 45) return { label: `${v}% C`, cls: "bg-orange-100 text-orange-700" };
  return { label: `${v}% F`, cls: "bg-red-100 text-red-700" };
}

const STUDENTS = [
  { name: "Amaka Promise", class: "JSS 2", avg: 42 },
  { name: "John Doe", class: "SS1", avg: 38 },
  { name: "Sarah Johnson", class: "SS2", avg: 78 },
  { name: "Michael Lee", class: "JSS 3", avg: 65 },
];

const RECENT_ASSESSMENTS = [
  { type: "DRILL", subject: "Multi-Subject", class: "SS1" },
  { type: "QUIZ", subject: "Multi-Subject", class: "SS1" },
  { type: "Revision Exercise", subject: "English Language", class: "JSS2" },
  { type: "Mixed Class Test", subject: "English Language", class: "JSS1" },
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

function Dashboard() {
  const [selected, setSelected] = useState<string>(STUDENTS[0].name);
  const belowFifty = STUDENTS.filter((s) => s.avg < 50);
  const student = STUDENTS.find((s) => s.name === selected)!;
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <motion.header {...fadeUp} className="glass rounded-3xl p-6 md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" /> {today}
            </div>
            <h1 className="mt-2 text-3xl font-bold md:text-4xl">
              Welcome back, <span className="text-gradient-primary">{TEACHER}</span> ✨
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your AI co-teacher is ready. Let's make today legendary.
            </p>
          </div>
          <div className="bg-gradient-primary glow-primary flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-white">
            <Sparkles className="h-4 w-4" /> AI Online
          </div>
        </div>
      </motion.header>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {METRICS.map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ scale: 1.03 }}
              className={`bg-gradient-to-br ${m.gradient} relative overflow-hidden rounded-2xl p-5 text-white shadow-lg`}
            >
              <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/20 blur-2xl" />
              <Icon className="h-6 w-6 opacity-90" />
              <div className="mt-6 text-4xl font-bold">{m.value}</div>
              <div className="mt-1 text-sm opacity-90">{m.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick actions */}
      <section>
        <h2 className="mb-4 text-xl font-bold">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_ACTIONS.map((a, i) => {
            const Icon = a.icon;
            return (
              <motion.div
                key={a.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
              >
                <Link
                  to={a.to}
                  className="glass group flex items-center justify-between rounded-2xl p-5 transition-all hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className={`${a.color} flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="font-semibold">{a.label}</div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Heatmap */}
      <motion.section {...fadeUp} className="glass rounded-3xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Subject Performance Heatmap</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-separate border-spacing-1">
            <thead>
              <tr>
                <th className="text-left text-xs font-semibold text-muted-foreground">Subject</th>
                {CLASSES.map((c) => (
                  <th key={c} className="text-xs font-semibold text-muted-foreground">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SUBJECTS.map((s) => (
                <tr key={s}>
                  <td className="py-1 pr-3 text-sm font-medium">{s}</td>
                  {CLASSES.map((c) => {
                    const v = HEATMAP[s]?.[c];
                    const g = gradeFor(v);
                    return (
                      <td key={c} className="p-1">
                        <div className={`rounded-lg px-2 py-2 text-center text-xs font-semibold ${g.cls}`}>
                          {g.label}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-5 flex flex-wrap gap-3 text-xs">
          <Legend cls="bg-emerald-100 text-emerald-700" label="A · 70-100" />
          <Legend cls="bg-yellow-100 text-yellow-700" label="B · 60-69" />
          <Legend cls="bg-orange-100 text-orange-700" label="C · 45-59" />
          <Legend cls="bg-red-100 text-red-700" label="F · <45" />
          <Legend cls="bg-slate-100 text-slate-400" label="No data" />
        </div>
      </motion.section>

      {/* Student profiles */}
      <motion.section {...fadeUp} className="glass rounded-3xl p-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-bold">Student Profiles</h2>
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
            <AlertCircle className="h-3 w-3" /> {belowFifty.length} below 50%
          </span>
        </div>

        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="w-full max-w-sm rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-medium shadow-sm focus:ring-2 focus:ring-primary focus:outline-none"
        >
          {STUDENTS.map((s) => (
            <option key={s.name} value={s.name}>{s.name}</option>
          ))}
        </select>

        <motion.div
          key={student.name}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-2xl border border-border bg-white p-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-lg font-bold">{student.name}</div>
              <div className="text-sm text-muted-foreground">Class: {student.class} · Average: <span className="font-semibold text-foreground">{student.avg}%</span></div>
            </div>
            <button
              onClick={() => console.log(`Generating parent meeting notes for ${student.name}`)}
              className="bg-gradient-primary glow-primary rounded-xl px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-105"
            >
              Generate Parent Meeting Notes
            </button>
          </div>
        </motion.div>

        <div className="mt-6">
          <div className="mb-2 text-sm font-semibold">Needs Extra Support</div>
          <div className="flex flex-wrap gap-2">
            {belowFifty.map((s) => (
              <button
                key={s.name}
                onClick={() => setSelected(s.name)}
                className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
              >
                {s.name} · {s.avg}%
              </button>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Recent */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.section {...fadeUp} className="glass rounded-3xl p-6">
          <h2 className="mb-4 text-xl font-bold">Recent Lesson Notes</h2>
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">No lesson notes yet. Create your first one!</p>
            <Link
              to="/lesson-notes"
              className="bg-gradient-primary mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
            >
              Create now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.section>

        <motion.section {...fadeUp} className="glass rounded-3xl p-6">
          <h2 className="mb-4 text-xl font-bold">Recent Assessments</h2>
          <ul className="space-y-2">
            {RECENT_ASSESSMENTS.map((a, i) => (
              <li
                key={i}
                className="group flex items-center justify-between rounded-2xl border border-border bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
              >
                <div>
                  <div className="text-sm font-bold">{a.type}</div>
                  <div className="text-xs text-muted-foreground">{a.subject} · {a.class}</div>
                </div>
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold tracking-wide text-amber-700 uppercase">
                  draft
                </span>
              </li>
            ))}
          </ul>
        </motion.section>
      </div>
    </div>
  );
}

function Legend({ cls, label }: { cls: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`inline-block h-4 w-6 rounded ${cls}`} />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
