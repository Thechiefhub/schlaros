import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  FileText,
  ClipboardList,
  BookOpen,
  FolderOpen,
  Bot,
  Database,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Calendar,
  Briefcase,
  GraduationCap,
  Layers,
  CheckCircle2,
  RefreshCw,
  Clock,
  CheckSquare,
  BarChart3,
  Award,
} from "lucide-react";
import { getSession } from "@/lib/store";

export type UserSession = {
  name?: string;
  role?: string;
  school?: string;
  klass?: string;
  wardAdmissionNo?: string;
  email?: string;
  admissionNo?: string;
};

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — SchlarOS" },
      { name: "description", content: "Your educational operating system command center." },
    ],
  }),
  component: Dashboard,
});

const CLASSES_LIST = ["JSS 1", "JSS 2", "JSS 3", "SS1", "SS2", "SS3"];
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
  const navigate = useNavigate();
  const [session, setSession] = useState(() => getSession());

  useEffect(() => {
    const handleAuth = () => {
      setSession(getSession());
    };
    window.addEventListener("schlaros-auth-change", handleAuth);
    return () => window.removeEventListener("schlaros-auth-change", handleAuth);
  }, []);

  const role = session?.role ?? "teacher";

  // RENDER STUDENT DASHBOARD DIRECTLY HERE OR REDIRECT
  if (role === "student") {
    return <StudentDashboard session={session} />;
  }

  // RENDER PARENT DASHBOARD
  if (role === "parent") {
    return <ParentDashboard session={session} />;
  }

  // RENDER ADMIN DASHBOARD
  if (role === "admin") {
    return <AdminDashboard session={session} />;
  }

  // DEFAULT TEACHER DASHBOARD
  return <TeacherDashboard session={session} />;
}

// ── STUDENT DASHBOARD VIEW ────────────────────────────────────────────────
function StudentDashboard({ session }: { session: UserSession | null | undefined }) {
  const name = session?.name ?? "Student";
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Greeting Banner */}
      <motion.header
        {...fadeUp}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 p-8 text-white shadow-xl"
      >
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            <GraduationCap className="h-3.5 w-3.5" /> Student Workspace
          </span>
          <h1 className="mt-4 text-3xl font-extrabold md:text-4xl">Welcome back, {name}! 🌟</h1>
          <p className="mt-2 text-cyan-100 max-w-xl text-sm leading-relaxed">
            Let's keep up the great learning streak! Your subject schedules, assigned homework
            drills, and term progress cards are ready.
          </p>
          <div className="mt-6">
            <Link
              to="/parent-portal"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700 shadow-md transition-transform hover:scale-[1.02]"
            >
              Open Student Portal <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
          <Calendar className="h-6 w-6 text-cyan-400" />
          <h3 className="font-bold text-white">Today's Class Schedule</h3>
          <p className="text-xs text-white/50">4 core subjects on schedule today.</p>
          <Link
            to="/parent-portal"
            className="inline-flex items-center gap-1 text-xs font-bold text-cyan-400 hover:underline"
          >
            View Schedule <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
          <CheckSquare className="h-6 w-6 text-pink-400" />
          <h3 className="font-bold text-white">Pending Assignments</h3>
          <p className="text-xs text-white/50">2 quizzes and 1 written drill open.</p>
          <Link
            to="/parent-portal"
            className="inline-flex items-center gap-1 text-xs font-bold text-pink-400 hover:underline"
          >
            Complete Homework <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-3">
          <Award className="h-6 w-6 text-emerald-400" />
          <h3 className="font-bold text-white">Academic Achievement</h3>
          <p className="text-xs text-white/50">Your current grade average is 84% (B+).</p>
          <Link
            to="/parent-portal"
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:underline"
          >
            View Grades <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── ADMIN OPERATIONS DASHBOARD ─────────────────────────────────────────────
function AdminDashboard({ session }: { session: UserSession | null | undefined }) {
  const [syncStep, setSyncStep] = useState<number>(-1);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccess, setSyncSuccess] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([
    "System boot: Relational index successfully validated.",
    "Awaiting school registry synchronization...",
  ]);

  const [counts, setCounts] = useState({ teachers: 2, students: 4, classes: 3 });

  // Read live local storage counts
  useEffect(() => {
    const getLSLength = (key: string, def: number) => {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return def;
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.length : def;
      } catch {
        return def;
      }
    };
    setCounts({
      teachers: getLSLength("tg.teachers", 2),
      students: getLSLength("tg.students", 4),
      classes: getLSLength("tg.classes", 3),
    });
  }, []);

  const syncSteps = [
    "Validating school registry schemas...",
    "Compressing student & class relational arrays...",
    "Establishing secure pipeline to SchlarOS Core...",
    "Publishing teachers and class timetables...",
    "Registry synchronized successfully!",
  ];

  function runSync() {
    setIsSyncing(true);
    setSyncSuccess(false);
    setSyncStep(0);
    setLogs((prev) => [`Initiating manual sync at ${new Date().toLocaleTimeString()}...`, ...prev]);

    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      if (current < syncSteps.length) {
        setSyncStep(current);
        setLogs((prev) => [syncSteps[current], ...prev]);
      } else {
        clearInterval(interval);
        setIsSyncing(false);
        setSyncSuccess(true);
        setLogs((prev) => ["SchlarOS Central DB is fully up to date.", ...prev]);
      }
    }, 1200);
  }

  const name = session?.name ?? "Administrator";

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <motion.header {...fadeUp} className="glass rounded-3xl p-6 md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <span className="flex h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
              School Operations Center
            </div>
            <h1 className="mt-2 text-3xl font-bold md:text-4xl">
              School Administrator Command, <span className="text-gradient-primary">{name}</span> ✨
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage school-wide resources, teachers registry, classes structure, and push live
              records into SchlarOS.
            </p>
          </div>
          <div className="bg-gradient-primary glow-primary flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-white">
            <Database className="h-4 w-4" /> Relational DB Online
          </div>
        </div>
      </motion.header>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: "Active Teachers",
            value: counts.teachers,
            icon: Briefcase,
            gradient: "from-violet-500 to-indigo-500",
            to: "/teachers",
          },
          {
            label: "Total Students",
            value: counts.students,
            icon: GraduationCap,
            gradient: "from-pink-500 to-rose-500",
            to: "/students",
          },
          {
            label: "Registered Classes",
            value: counts.classes,
            icon: Layers,
            gradient: "from-cyan-500 to-blue-500",
            to: "/classes",
          },
          {
            label: "Sync Registry",
            value: syncSuccess ? "Synced" : "Awaiting Sync",
            icon: CheckCircle2,
            gradient: "from-emerald-500 to-teal-500",
            to: "#sync",
          },
        ].map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => m.to.startsWith("/") && navigate({ to: m.to })}
              className={`bg-gradient-to-br ${m.gradient} relative overflow-hidden rounded-2xl p-5 text-white shadow-lg cursor-pointer`}
            >
              <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
              <Icon className="h-6 w-6 opacity-90" />
              <div className="mt-6 text-3xl font-bold">{m.value}</div>
              <div className="mt-1 text-sm opacity-90">{m.label}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3" id="sync">
        {/* Sync Center */}
        <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/[0.03] p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <RefreshCw
                  className={`h-5 w-5 text-indigo-400 ${isSyncing ? "animate-spin" : ""}`}
                />
                SchlarOS Registry Sync Engine
              </h2>
              <p className="text-xs text-white/50 mt-1">
                Publish offline registers, roster lists, and departments directly to SchlarOS
                servers.
              </p>
            </div>
            <button
              onClick={runSync}
              disabled={isSyncing}
              className="bg-gradient-primary glow-primary disabled:opacity-55 flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-transform hover:scale-105"
            >
              {isSyncing ? "Syncing..." : "Sync to SchlarOS"}
            </button>
          </div>

          {/* Progress bar */}
          {(isSyncing || syncSuccess) && (
            <div className="space-y-2.5 rounded-xl bg-white/5 p-4 border border-white/10">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white/80">
                  {isSyncing ? syncSteps[syncStep] : "Registry fully synchronized"}
                </span>
                <span className="text-indigo-400 font-bold">
                  {isSyncing ? `${Math.round(((syncStep + 1) / syncSteps.length) * 100)}%` : "100%"}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{
                    width: isSyncing ? `${((syncStep + 1) / syncSteps.length) * 100}%` : "100%",
                  }}
                  className="bg-gradient-primary h-full rounded-full"
                />
              </div>
            </div>
          )}

          {/* Quick Registry Action Panel */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white/70">Quick Registrars</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Link
                to="/teachers"
                className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 p-3 hover:bg-white/10 text-white"
              >
                <div className="bg-violet-500/20 text-violet-400 p-2 rounded-lg">
                  <Briefcase className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="text-xs font-bold">Teachers</div>
                  <div className="text-[10px] text-white/50">Register teachers</div>
                </div>
              </Link>
              <Link
                to="/students"
                className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 p-3 hover:bg-white/10 text-white"
              >
                <div className="bg-pink-500/20 text-pink-400 p-2 rounded-lg">
                  <GraduationCap className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="text-xs font-bold">Students</div>
                  <div className="text-[10px] text-white/50">Enroll students</div>
                </div>
              </Link>
              <Link
                to="/classes"
                className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/10 p-3 hover:bg-white/10 text-white"
              >
                <div className="bg-cyan-500/20 text-cyan-400 p-2 rounded-lg">
                  <Layers className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="text-xs font-bold">Classes</div>
                  <div className="text-[10px] text-white/50">Structure arms</div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Sync Log */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 flex flex-col h-[320px]">
          <h3 className="text-sm font-bold text-white mb-3">Sync Operations Audit Log</h3>
          <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin text-[11px] font-mono">
            {logs.map((log, idx) => (
              <div key={idx} className="flex gap-2 text-white/60">
                <span className="text-indigo-400 font-bold shrink-0">❯</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── TEACHER DASHBOARD VIEW ────────────────────────────────────────────────
function TeacherDashboard({ session }: { session: UserSession | null | undefined }) {
  const [selected, setSelected] = useState<string>(STUDENTS[0].name);
  const belowFifty = STUDENTS.filter((s) => s.avg < 50);
  const student = STUDENTS.find((s) => s.name === selected)!;
  const teacherName = session?.name ?? "Tolulope";
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const METRICS = [
    {
      label: "Lesson Notes",
      value: 12,
      icon: FileText,
      gradient: "from-purple-400 via-pink-400 to-orange-400",
    },
    { label: "Assessments", value: 8, icon: ClipboardList, gradient: "from-blue-400 to-cyan-300" },
    { label: "Lesson Plans", value: 4, icon: BookOpen, gradient: "from-emerald-400 to-teal-300" },
    { label: "Resources", value: 15, icon: FolderOpen, gradient: "from-amber-400 to-pink-400" },
  ];

  const QUICK_ACTIONS = [
    { label: "Generate Lesson Note", to: "/lesson-notes", icon: FileText, color: "bg-purple-500" },
    { label: "Create Assessment", to: "/assessments", icon: ClipboardList, color: "bg-pink-500" },
    { label: "AI Assistant", to: "/ai-assistant", icon: Bot, color: "bg-cyan-500" },
    { label: "Question Bank", to: "/question-bank", icon: Database, color: "bg-amber-500" },
    { label: "Lesson Plans", to: "/lesson-plans", icon: BookOpen, color: "bg-emerald-500" },
    { label: "Resources", to: "/resources", icon: FolderOpen, color: "bg-rose-500" },
  ] as const;

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
              Welcome back, <span className="text-gradient-primary">{teacherName}</span> ✨
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
                    <div
                      className={`${a.color} flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md`}
                    >
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
                {CLASSES_LIST.map((c) => (
                  <th key={c} className="text-xs font-semibold text-muted-foreground">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SUBJECTS.map((s) => (
                <tr key={s}>
                  <td className="py-1 pr-3 text-sm font-medium">{s}</td>
                  {CLASSES_LIST.map((c) => {
                    const v = HEATMAP[s]?.[c];
                    const g = gradeFor(v);
                    return (
                      <td key={c} className="p-1">
                        <div
                          className={`rounded-lg px-2 py-2 text-center text-xs font-semibold ${g.cls}`}
                        >
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
            <option key={s.name} value={s.name}>
              {s.name}
            </option>
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
              <div className="text-sm text-muted-foreground">
                Class: {student.class} · Average:{" "}
                <span className="font-semibold text-foreground">{student.avg}%</span>
              </div>
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
            <p className="mt-3 text-sm text-muted-foreground">
              No lesson notes yet. Create your first one!
            </p>
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
                  <div className="text-xs text-muted-foreground">
                    {a.subject} · {a.class}
                  </div>
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

// ── PARENT DASHBOARD VIEW ──────────────────────────────────────────────────
function ParentDashboard({ session }: { session: UserSession | null | undefined }) {
  const name = session?.name ?? "Parent";
  const childName = "Amaka Promise"; // Default connected child
  const admissionNo = session?.wardAdmissionNo ?? "SCH/2026/084";

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Greeting Banner */}
      <motion.header
        {...fadeUp}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 p-8 text-white shadow-xl"
      >
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="relative space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-amber-200" /> Parent Portal Dashboard
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white">
            Welcome back, {name}!
          </h1>
          <p className="max-w-md text-sm text-white/80">
            Monitoring the real-time academic progression, billing, and attendance index for{" "}
            <span className="font-bold underline text-white">{childName}</span> (ID: {admissionNo}).
          </p>
        </div>
      </motion.header>

      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Overall GPA Index",
            value: "85.0% - Grade A",
            sub: "Class average: 74.2%",
            icon: Award,
            cls: "text-amber",
          },
          {
            label: "Attendance Record",
            value: "96.4%",
            sub: "Total present: 54/56",
            icon: CheckCircle2,
            cls: "text-emerald-500",
          },
          {
            label: "Assignment Completion",
            value: "14 / 16 Done",
            sub: "2 pending for this Friday",
            icon: CheckSquare,
            cls: "text-cyan",
          },
          {
            label: "Current Term Tuition",
            value: "Paid in Full",
            sub: "Receipt: #TXN-9024",
            icon: GraduationCap,
            cls: "text-purple-400",
          },
        ].map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={i}
              {...fadeUp}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-3xl p-5 hover:shadow-lg transition-shadow border border-white/10"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground">{c.label}</span>
                  <div className="mt-2 text-xl font-bold text-white">{c.value}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{c.sub}</p>
                </div>
                <div className={`rounded-xl bg-white/5 p-2.5 ${c.cls}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Grid: Homework Monitor, PTA Board, Term Grades */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Homework / Assignment Checklist */}
        <motion.section
          {...fadeUp}
          className="glass rounded-3xl p-6 lg:col-span-2 border border-white/10"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-electric-pink" /> Ward Homework & Assignments
            </h2>
            <Link
              to="/parent-portal"
              className="text-xs font-semibold text-primary hover:underline"
            >
              View Grade Book
            </Link>
          </div>
          <div className="space-y-3">
            {[
              {
                subject: "Biology",
                task: "Draw and label a mammalian heart diagram with functions",
                status: "Submitted",
                due: "Yesterday",
                grade: "94%",
              },
              {
                subject: "Mathematics",
                task: "Solve Algebraic equations set 4B on quadratic models",
                status: "Pending",
                due: "Friday",
                grade: "—",
              },
              {
                subject: "English Language",
                task: "Write a 500-word argumentative essay on 'AI in schools'",
                status: "Submitted",
                due: "3 days ago",
                grade: "88%",
              },
            ].map((hw, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                      {hw.subject}
                    </span>
                    <span className="text-xs text-muted-foreground">Due: {hw.due}</span>
                  </div>
                  <p className="mt-1.5 text-xs text-white/90 truncate">{hw.task}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      hw.status === "Submitted"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-amber-500/15 text-amber-400 animate-pulse"
                    }`}
                  >
                    {hw.status}
                  </span>
                  {hw.grade !== "—" && (
                    <div className="mt-1 text-xs font-bold text-white/80">Grade: {hw.grade}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* PTA Bulletins & Notifications */}
        <motion.section {...fadeUp} className="glass rounded-3xl p-6 border border-white/10">
          <h2 className="mb-4 text-xl font-bold text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-cyan" /> PTA Board & Bulletins
          </h2>
          <div className="space-y-4">
            {[
              {
                title: "PTA General Assembly Meeting",
                desc: "Discussion on school sports infrastructure upgrading.",
                date: "Sept 25, 2026",
              },
              {
                title: "Mid-Term Academic Consultation",
                desc: "One-on-one virtual consultation session schedule with subject mentors.",
                date: "Oct 02, 2026",
              },
            ].map((pta, idx) => (
              <div key={idx} className="space-y-1.5 border-l-2 border-primary/40 pl-3">
                <div className="text-xs font-bold text-white">{pta.title}</div>
                <p className="text-[11px] text-white/60 leading-relaxed">{pta.desc}</p>
                <div className="text-[10px] text-white/40">{pta.date}</div>
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
