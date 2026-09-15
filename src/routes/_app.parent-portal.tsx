import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  BookOpen,
  User,
  Award,
  CheckSquare,
  Sparkles,
  ChevronRight,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FileText,
} from "lucide-react";
import { getSession } from "@/lib/store";

export const Route = createFileRoute("/_app/parent-portal")({
  head: () => ({
    meta: [
      { title: "Student & Parent Portal — SchlarOS" },
      { name: "description", content: "Access your school timetable, active assignments, and academic reports." },
    ],
  }),
  component: StudentParentPortal,
});

interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  points: number;
  status: "pending" | "completed";
  grade?: string;
  feedback?: string;
}

const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: "1",
    title: "Cell Division & Mitosis Worksheet",
    subject: "Biology",
    dueDate: "Sept 18, 2026",
    points: 100,
    status: "pending",
  },
  {
    id: "2",
    title: "Quadratic Equations Practice Drill",
    subject: "Mathematics",
    dueDate: "Sept 20, 2026",
    points: 50,
    status: "completed",
    grade: "92%",
    feedback: "Excellent understanding of factorization methods!",
  },
  {
    id: "3",
    title: "Essay: The Impact of Colonialism in West Africa",
    subject: "History",
    dueDate: "Sept 24, 2026",
    points: 100,
    status: "pending",
  },
  {
    id: "4",
    title: "Grammar & Concord Revision Quiz",
    subject: "English Language",
    dueDate: "Sept 14, 2026",
    points: 20,
    status: "completed",
    grade: "85%",
    feedback: "Watch out for subject-verb agreement with collective nouns.",
  },
];

const TIMETABLE = {
  Monday: [
    { time: "08:00 - 09:30", subject: "Biology", teacher: "Mr. Tolulope", room: "Lab 2" },
    { time: "09:45 - 11:15", subject: "Mathematics", teacher: "Mrs. Adesuwa", room: "Classroom A" },
    { time: "11:30 - 13:00", subject: "English Language", teacher: "Mr. Okafor", room: "Classroom A" },
  ],
  Tuesday: [
    { time: "08:00 - 09:30", subject: "Chemistry", teacher: "Dr. Chioma", room: "Lab 1" },
    { time: "09:45 - 11:15", subject: "History", teacher: "Mr. Adeleke", room: "Classroom B" },
    { time: "11:30 - 13:00", subject: "Mathematics", teacher: "Mrs. Adesuwa", room: "Classroom A" },
  ],
  Wednesday: [
    { time: "08:00 - 09:30", subject: "Biology", teacher: "Mr. Tolulope", room: "Lab 2" },
    { time: "09:45 - 11:15", subject: "Physics", teacher: "Engr. Yusuf", room: "Lab 3" },
    { time: "11:30 - 13:00", subject: "English Language", teacher: "Mr. Okafor", room: "Classroom A" },
  ],
  Thursday: [
    { time: "08:00 - 09:30", subject: "Chemistry", teacher: "Dr. Chioma", room: "Lab 1" },
    { time: "09:45 - 11:15", subject: "Mathematics", teacher: "Mrs. Adesuwa", room: "Classroom A" },
    { time: "11:30 - 13:00", subject: "History", teacher: "Mr. Adeleke", room: "Classroom B" },
  ],
  Friday: [
    { time: "08:00 - 09:30", subject: "Physics", teacher: "Engr. Yusuf", room: "Lab 3" },
    { time: "09:45 - 11:15", subject: "Agricultural Science", teacher: "Miss Ngozi", room: "Garden Field" },
    { time: "11:30 - 13:00", subject: "Civic Education", teacher: "Mr. Adeleke", room: "Classroom A" },
  ],
};

const SUBJECT_GRADES = [
  { subject: "Biology", score: 92, grade: "A", classAverage: 74 },
  { subject: "Mathematics", score: 88, grade: "A", classAverage: 68 },
  { subject: "English Language", score: 85, grade: "B", classAverage: 71 },
  { subject: "Chemistry", score: 78, grade: "B", classAverage: 65 },
  { subject: "Physics", score: 72, grade: "C", classAverage: 62 },
  { subject: "History", score: 95, grade: "A", classAverage: 78 },
];

const fadeUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
};

function StudentParentPortal() {
  const [session, setSession] = useState(() => getSession());
  const [activeTab, setActiveTab] = useState<"timetable" | "assignments" | "grades">("timetable");
  const [selectedDay, setSelectedDay] = useState<keyof typeof TIMETABLE>("Monday");
  const [assignments, setAssignments] = useState<Assignment[]>(INITIAL_ASSIGNMENTS);

  useEffect(() => {
    const handleAuth = () => {
      setSession(getSession());
    };
    window.addEventListener("schlaros-auth-change", handleAuth);
    return () => window.removeEventListener("schlaros-auth-change", handleAuth);
  }, []);

  const studentName = session?.role === "student" ? session.name : "Amaka Promise";
  const studentKlass = session?.role === "student" ? (session.klass || "SS3 Gold") : "SS3 Gold";

  const toggleAssignment = (id: string) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const nextStatus = a.status === "pending" ? "completed" : "pending";
        return {
          ...a,
          status: nextStatus,
          grade: nextStatus === "completed" ? "Pending Grading" : undefined,
          feedback: nextStatus === "completed" ? "Successfully submitted on-time." : undefined,
        };
      })
    );
  };

  const pendingCount = assignments.filter((a) => a.status === "pending").length;

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-1 md:p-4">
      {/* Dynamic Student Header Card */}
      <motion.header
        {...fadeUp}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 p-6 md:p-8 text-white shadow-xl"
      >
        <div className="absolute top-0 right-0 -mr-12 -mt-12 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <GraduationCap className="h-3.5 w-3.5" /> Student & Parent Workspace
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">
              {studentName}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-indigo-100">
              <span className="flex items-center gap-1.5 bg-black/15 px-2.5 py-1 rounded-lg">
                <User className="h-4 w-4" /> Class: {studentKlass}
              </span>
              <span className="flex items-center gap-1.5 bg-black/15 px-2.5 py-1 rounded-lg">
                <Award className="h-4 w-4" /> Grade Point Avg: 85.0% (A)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-4 border border-white/10 max-w-xs">
            <AlertCircle className="h-5 w-5 text-pink-300 shrink-0" />
            <p className="text-xs text-indigo-50 leading-relaxed">
              You have <span className="font-bold text-white underline">{pendingCount} pending</span> assignments due this week. Keep going!
            </p>
          </div>
        </div>
      </motion.header>

      {/* Navigation tabs */}
      <div className="flex border-b border-white/10">
        {(["timetable", "assignments", "grades"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-sm font-bold border-b-2 capitalize transition-colors ${
              activeTab === tab
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-white/60 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tabs panels */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
        >
          {/* TIMETABLE VIEW */}
          {activeTab === "timetable" && (
            <div className="grid gap-6 md:grid-cols-4">
              {/* Day Selector */}
              <div className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
                {(Object.keys(TIMETABLE) as Array<keyof typeof TIMETABLE>).map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`flex-1 shrink-0 px-4 py-3 text-left rounded-xl text-sm font-bold transition-all ${
                      selectedDay === day
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "bg-white/5 border border-white/5 hover:bg-white/10 text-white/80"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>

              {/* Day Schedule timeline */}
              <div className="md:col-span-3 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">{selectedDay} Classes</h3>
                  <span className="text-xs text-white/50">{TIMETABLE[selectedDay].length} Lectures scheduled</span>
                </div>

                <div className="space-y-3">
                  {TIMETABLE[selectedDay].map((period, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/10 text-primary p-3 rounded-xl shrink-0">
                          <Clock className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-base font-bold text-white">{period.subject}</div>
                          <div className="text-xs text-white/50 flex items-center gap-1.5 mt-1">
                            <span className="font-semibold text-white/70">{period.teacher}</span>
                            <span>•</span>
                            <span>Room: {period.room}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-primary font-mono bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10 self-start sm:self-auto">
                        {period.time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ASSIGNMENTS VIEW */}
          {activeTab === "assignments" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Your Term Assignments</h3>
                <span className="text-xs text-white/50">{pendingCount} Active Pending tasks</span>
              </div>

              <div className="grid gap-4">
                {assignments.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all ${
                      item.status === "completed"
                        ? "border-white/5 bg-white/[0.01] opacity-75"
                        : "border-white/10 bg-white/[0.03] hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => toggleAssignment(item.id)}
                        className={`mt-1 h-5.5 w-5.5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                          item.status === "completed"
                            ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                            : "border-white/30 hover:border-primary text-transparent"
                        }`}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className={`text-base font-bold ${item.status === "completed" ? "line-through text-white/50" : "text-white"}`}>
                            {item.title}
                          </h4>
                          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/70">
                            {item.subject}
                          </span>
                        </div>
                        <p className="text-xs text-white/40 flex items-center gap-2">
                          <span>Due: {item.dueDate}</span>
                          <span>•</span>
                          <span>Points: {item.points}</span>
                        </p>
                        {item.feedback && (
                          <div className="mt-2.5 rounded-lg bg-white/5 border border-white/5 p-3 text-xs text-white/70 italic">
                            <span className="font-bold text-white not-italic block mb-0.5">Teacher Feedback:</span>
                            "{item.feedback}"
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 self-end md:self-auto">
                      {item.status === "completed" && item.grade ? (
                        <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 text-xs font-bold text-emerald-400">
                          <Award className="h-3.5 w-3.5" /> Grade: {item.grade}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3.5 py-1.5 text-xs font-bold text-amber-400">
                          <Clock className="h-3.5 w-3.5" /> Pending
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GRADES VIEW */}
          {activeTab === "grades" && (
            <div className="space-y-6">
              {/* Term metrics cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-1.5">
                  <div className="text-xs text-white/50">Overall Average</div>
                  <div className="text-3xl font-extrabold text-white">85.0%</div>
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                    <TrendingUp className="h-3 w-3" /> Term Target (80%) Exceeded
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-1.5">
                  <div className="text-xs text-white/50">Rank in Class</div>
                  <div className="text-3xl font-extrabold text-white">5th of 32</div>
                  <div className="text-[10px] text-white/40">Upper 15th Percentile</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-1.5">
                  <div className="text-xs text-white/50">Total Submissions</div>
                  <div className="text-3xl font-extrabold text-white">24 / 24</div>
                  <div className="text-[10px] text-emerald-400 font-semibold">100% On-Time Completion</div>
                </div>
              </div>

              {/* Subjects score breakdown */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
                <h3 className="text-lg font-bold text-white">Term Academic Transcript</h3>
                <div className="divide-y divide-white/10 space-y-4">
                  {SUBJECT_GRADES.map((item, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 first:pt-0">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between text-sm font-semibold text-white">
                          <span>{item.subject}</span>
                          <span className="font-mono text-xs text-white/60">Class Avg: {item.classAverage}%</span>
                        </div>
                        {/* Custom responsive progress bars */}
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden relative">
                          {/* Class average marker */}
                          <div
                            style={{ left: `${item.classAverage}%` }}
                            className="absolute top-0 h-full w-0.5 bg-white/35 z-10"
                            title={`Class Average: ${item.classAverage}%`}
                          />
                          <div
                            style={{ width: `${item.score}%` }}
                            className="bg-gradient-to-r from-indigo-500 to-pink-500 h-full rounded-full"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-3 justify-end shrink-0 sm:pl-6">
                        <span className="text-lg font-extrabold text-white">{item.score}%</span>
                        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-extrabold bg-white/10 text-white`}>
                          {item.grade}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
