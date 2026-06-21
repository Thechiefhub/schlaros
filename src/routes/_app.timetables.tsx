import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock, Cpu, Plus, Trash2, Sparkles, AlertTriangle, Download, Upload, LayoutTemplate } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { PageHeader, Section } from "@/components/page-header";
import { usePersisted } from "@/hooks/use-persisted";
import {
  solveTimetable,
  type Course,
  type Teacher,
  type Room,
  type Mode,
  type SolveResult,
} from "@/lib/timetable-solver";
import { ALL_NERDC_CLASSES, ALL_NERDC_SUBJECTS } from "@/lib/nerdc-curriculum";

export const Route = createFileRoute("/_app/timetables")({
  head: () => ({ meta: [{ title: "Timetables — SchlarOS" }] }),
  component: TimetablesPage,
});

const DEFAULT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

// ---------- Reusable templates ----------
type Template = {
  id: string;
  label: string;
  description: string;
  mode: Mode;
  days: string[];
  periods: number;
  apply: (current: { teachers: Teacher[]; rooms: Room[] }) => {
    courses?: Course[];
    rooms?: Room[];
  };
};

const TEMPLATES: Template[] = [
  {
    id: "class-week",
    label: "Standard class week",
    description: "Mon–Fri · 8 periods · core NERDC subjects",
    mode: "class",
    days: DEFAULT_DAYS,
    periods: 8,
    apply: ({ teachers }) => ({
      courses: [
        { id: uid(), subject: "Mathematics", classGroup: "JSS1", teacherId: teachers[0]?.id ?? "", periodsPerWeek: 5, heavy: true },
        { id: uid(), subject: "English Studies", classGroup: "JSS1", teacherId: teachers[1]?.id ?? teachers[0]?.id ?? "", periodsPerWeek: 4 },
        { id: uid(), subject: "Basic Science and Technology", classGroup: "JSS1", teacherId: teachers[2]?.id ?? teachers[0]?.id ?? "", periodsPerWeek: 3 },
      ],
    }),
  },
  {
    id: "mid-term-test",
    label: "Mid-term test week",
    description: "3 days · 2-period tests per subject",
    mode: "test",
    days: ["Mon", "Tue", "Wed"],
    periods: 6,
    apply: ({ teachers }) => ({
      courses: [
        { id: uid(), subject: "Mathematics", classGroup: "JSS1", teacherId: teachers[0]?.id ?? "", periodsPerWeek: 1, durationPeriods: 2, heavy: true },
        { id: uid(), subject: "English Studies", classGroup: "JSS1", teacherId: teachers[1]?.id ?? teachers[0]?.id ?? "", periodsPerWeek: 1, durationPeriods: 2 },
        { id: uid(), subject: "Basic Science and Technology", classGroup: "JSS1", teacherId: teachers[2]?.id ?? teachers[0]?.id ?? "", periodsPerWeek: 1, durationPeriods: 2 },
      ],
    }),
  },
  {
    id: "final-exam",
    label: "Final exam timetable",
    description: "5 days · 3-period exams in main hall",
    mode: "exam",
    days: DEFAULT_DAYS,
    periods: 6,
    apply: ({ teachers, rooms }) => ({
      rooms: rooms.some((r) => r.type === "hall") ? rooms : [...rooms, { id: uid(), name: "Main Hall", type: "hall" }],
      courses: [
        { id: uid(), subject: "Mathematics", classGroup: "SS3", teacherId: teachers[0]?.id ?? "", periodsPerWeek: 1, durationPeriods: 3, heavy: true },
        { id: uid(), subject: "English Studies", classGroup: "SS3", teacherId: teachers[1]?.id ?? teachers[0]?.id ?? "", periodsPerWeek: 1, durationPeriods: 3 },
        { id: uid(), subject: "Biology", classGroup: "SS3", teacherId: teachers[2]?.id ?? teachers[0]?.id ?? "", periodsPerWeek: 1, durationPeriods: 3 },
        { id: uid(), subject: "Chemistry", classGroup: "SS3", teacherId: teachers[0]?.id ?? "", periodsPerWeek: 1, durationPeriods: 3 },
        { id: uid(), subject: "Physics", classGroup: "SS3", teacherId: teachers[1]?.id ?? teachers[0]?.id ?? "", periodsPerWeek: 1, durationPeriods: 3 },
      ],
    }),
  },
];

// ---------- CSV parsing ----------
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.replace(/\r/g, "").split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];
  const splitRow = (row: string) => {
    const out: string[] = [];
    let cur = "";
    let q = false;
    for (let i = 0; i < row.length; i++) {
      const ch = row[i];
      if (ch === '"') {
        if (q && row[i + 1] === '"') { cur += '"'; i++; }
        else q = !q;
      } else if (ch === "," && !q) { out.push(cur); cur = ""; }
      else cur += ch;
    }
    out.push(cur);
    return out.map((c) => c.trim());
  };
  const headers = splitRow(lines[0]).map((h) => h.toLowerCase());
  return lines.slice(1).map((row) => {
    const cells = splitRow(row);
    const rec: Record<string, string> = {};
    headers.forEach((h, i) => (rec[h] = cells[i] ?? ""));
    return rec;
  });
}

function TimetablesPage() {
  const [mode, setMode] = usePersisted<Mode>("tg.tt.mode", "class");
  const [days, setDays] = usePersisted<string[]>("tg.tt.days", DEFAULT_DAYS);
  const [periods, setPeriods] = usePersisted<number>("tg.tt.periods", 8);

  const [teachers, setTeachers] = usePersisted<Teacher[]>("tg.tt.teachers", [
    { id: "t1", name: "Mrs. Adeyemi", maxPerDay: 5 },
    { id: "t2", name: "Mr. Okafor", maxPerDay: 5 },
    { id: "t3", name: "Ms. Bello", maxPerDay: 5 },
  ]);
  const [rooms, setRooms] = usePersisted<Room[]>("tg.tt.rooms", [
    { id: "r1", name: "Room A", type: "classroom" },
    { id: "r2", name: "Room B", type: "classroom" },
    { id: "r3", name: "Lab 1", type: "lab" },
    { id: "r4", name: "Main Hall", type: "hall" },
  ]);
  const [courses, setCourses] = usePersisted<Course[]>("tg.tt.courses", [
    { id: "c1", subject: "Mathematics", classGroup: "JSS1", teacherId: "t2", periodsPerWeek: 5, heavy: true },
    { id: "c2", subject: "English Studies", classGroup: "JSS1", teacherId: "t3", periodsPerWeek: 4 },
    { id: "c3", subject: "Basic Science and Technology", classGroup: "JSS1", teacherId: "t1", periodsPerWeek: 3 },
  ]);

  const [result, setResult] = useState<SolveResult | null>(null);
  const [filterClass, setFilterClass] = useState<string>("");

  const grid = useMemo(() => ({ days, periods }), [days, periods]);

  function run() {
    const r = solveTimetable(mode, grid, courses, teachers, rooms);
    setResult(r);
  }

  function addTeacher() {
    setTeachers([...teachers, { id: uid(), name: "New Teacher", maxPerDay: 5 }]);
  }
  function addRoom() {
    setRooms([...rooms, { id: uid(), name: "New Room", type: "classroom" }]);
  }
  function addCourse() {
    setCourses([
      ...courses,
      {
        id: uid(),
        subject: ALL_NERDC_SUBJECTS[0],
        classGroup: ALL_NERDC_CLASSES[0],
        teacherId: teachers[0]?.id ?? "",
        periodsPerWeek: 3,
      },
    ]);
  }

  function exportCSV() {
    if (!result) return;
    const rows = [["Day", "Period", "Class", "Subject", "Teacher", "Room", "Span"]];
    for (const s of result.slots) {
      const teacher = teachers.find((t) => t.id === s.teacherId)?.name ?? s.teacherId;
      const room = rooms.find((r) => r.id === s.roomId)?.name ?? s.roomId;
      rows.push([
        days[s.day] ?? `D${s.day}`,
        `P${s.period + 1}`,
        s.classGroup,
        s.subject,
        teacher,
        room,
        String(s.span),
      ]);
    }
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `schlaros-${mode}-timetable.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function applyTemplate(t: Template) {
    setMode(t.mode);
    setDays(t.days);
    setPeriods(t.periods);
    const out = t.apply({ teachers, rooms });
    if (out.rooms) setRooms(out.rooms);
    if (out.courses) setCourses([...courses, ...out.courses]);
  }

  async function importCSV<T>(
    file: File | null | undefined,
    mapper: (row: Record<string, string>) => T | null,
    onResult: (items: T[]) => void,
  ) {
    if (!file) return;
    const text = await file.text();
    const rows = parseCSV(text);
    const mapped = rows.map(mapper).filter((x): x is T => x !== null);
    if (mapped.length) onResult(mapped);
  }

  const teachersFileRef = useRef<HTMLInputElement>(null);
  const roomsFileRef = useRef<HTMLInputElement>(null);
  const coursesFileRef = useRef<HTMLInputElement>(null);

  const classGroups = useMemo(
    () => Array.from(new Set(courses.map((c) => c.classGroup))).sort(),
    [courses],
  );

  const visibleSlots = useMemo(() => {
    if (!result) return [];
    return filterClass ? result.slots.filter((s) => s.classGroup === filterClass) : result.slots;
  }, [result, filterClass]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        icon={CalendarClock}
        title="Timetable Generator"
        description="Operations-research solver for class, test and exam timetables — colleges, institutions and K-12."
        actions={
          <div className="flex flex-wrap gap-2">
            <select
              className="input"
              value={mode}
              onChange={(e) => setMode(e.target.value as Mode)}
              aria-label="Timetable mode"
            >
              <option value="class">Class timetable</option>
              <option value="test">Test timetable</option>
              <option value="exam">Exam timetable</option>
            </select>
            <button
              onClick={run}
              className="bg-gradient-primary glow-primary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white"
            >
              <Cpu className="h-4 w-4" /> Generate
            </button>
            {result && (
              <button
                onClick={exportCSV}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-white/70 px-3 py-2 text-sm font-semibold backdrop-blur"
              >
                <Download className="h-4 w-4" /> CSV
              </button>
            )}
          </div>
        }
      />

      <Section title="Schedule grid">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <label className="text-xs font-semibold text-muted-foreground">
            Days
            <input
              className="input mt-1"
              value={days.join(",")}
              onChange={(e) => setDays(e.target.value.split(",").map((d) => d.trim()).filter(Boolean))}
            />
          </label>
          <label className="text-xs font-semibold text-muted-foreground">
            Periods / day
            <input
              type="number"
              min={1}
              max={16}
              className="input mt-1"
              value={periods}
              onChange={(e) => setPeriods(Math.max(1, Math.min(16, Number(e.target.value) || 1)))}
            />
          </label>
        </div>
      </Section>

      <Section
        title="Reusable templates"
        action={<span className="text-xs text-muted-foreground">Prefill the planner with one click</span>}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => applyTemplate(t)}
              className="group flex flex-col items-start gap-1 rounded-2xl border border-border bg-white/70 p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
            >
              <div className="bg-gradient-primary inline-flex h-9 w-9 items-center justify-center rounded-xl text-white">
                <LayoutTemplate className="h-4 w-4" />
              </div>
              <div className="mt-2 text-sm font-semibold">{t.label}</div>
              <div className="text-xs text-muted-foreground">{t.description}</div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-wide text-primary">
                {t.mode} · {t.days.length}d × {t.periods}p
              </div>
            </button>
          ))}
        </div>
      </Section>

      <div className="grid gap-4 md:grid-cols-2">
        <Section
          title={`Teachers (${teachers.length})`}
          action={
            <div className="flex items-center gap-2">
              <button
                onClick={() => teachersFileRef.current?.click()}
                className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary"
                title="CSV columns: name, maxPerDay"
              >
                <Upload className="h-3.5 w-3.5" /> CSV
              </button>
              <input
                ref={teachersFileRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  importCSV(
                    e.target.files?.[0],
                    (row) => row.name ? { id: uid(), name: row.name, maxPerDay: Number(row.maxperday) || undefined } : null,
                    (items) => setTeachers([...teachers, ...items]),
                  );
                  e.target.value = "";
                }}
              />
              <button onClick={addTeacher} className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </div>
          }
        >
          <div className="space-y-2">
            {teachers.map((t, i) => (
              <div key={t.id} className="flex items-center gap-2">
                <input
                  className="input flex-1"
                  value={t.name}
                  onChange={(e) => {
                    const c = [...teachers];
                    c[i] = { ...t, name: e.target.value };
                    setTeachers(c);
                  }}
                />
                <input
                  type="number"
                  className="input w-20"
                  value={t.maxPerDay ?? 5}
                  onChange={(e) => {
                    const c = [...teachers];
                    c[i] = { ...t, maxPerDay: Number(e.target.value) || undefined };
                    setTeachers(c);
                  }}
                  aria-label="Max periods per day"
                  title="Max periods per day"
                />
                <button
                  onClick={() => setTeachers(teachers.filter((x) => x.id !== t.id))}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
                  aria-label="Remove teacher"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title={`Rooms (${rooms.length})`}
          action={
            <button onClick={addRoom} className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          }
        >
          <div className="space-y-2">
            {rooms.map((r, i) => (
              <div key={r.id} className="flex items-center gap-2">
                <input
                  className="input flex-1"
                  value={r.name}
                  onChange={(e) => {
                    const c = [...rooms];
                    c[i] = { ...r, name: e.target.value };
                    setRooms(c);
                  }}
                />
                <select
                  className="input w-28"
                  value={r.type ?? "classroom"}
                  onChange={(e) => {
                    const c = [...rooms];
                    c[i] = { ...r, type: e.target.value as Room["type"] };
                    setRooms(c);
                  }}
                  aria-label="Room type"
                >
                  <option value="classroom">Class</option>
                  <option value="lab">Lab</option>
                  <option value="hall">Hall</option>
                </select>
                <button
                  onClick={() => setRooms(rooms.filter((x) => x.id !== r.id))}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
                  aria-label="Remove room"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <Section
        title={`Courses (${courses.length})`}
        action={
          <button onClick={addCourse} className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
            <Plus className="h-3.5 w-3.5" /> Add course
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="p-2 text-left">Subject (NERDC)</th>
                <th className="p-2 text-left">Class</th>
                <th className="p-2 text-left">Teacher</th>
                <th className="p-2 text-left">{mode === "class" ? "Periods/wk" : "Duration"}</th>
                <th className="p-2 text-left">Heavy</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {courses.map((c, i) => (
                <tr key={c.id} className="border-t border-border/40">
                  <td className="p-1">
                    <select
                      className="input"
                      value={c.subject}
                      onChange={(e) => {
                        const next = [...courses];
                        next[i] = { ...c, subject: e.target.value };
                        setCourses(next);
                      }}
                    >
                      {ALL_NERDC_SUBJECTS.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-1">
                    <input
                      className="input"
                      list="nerdc-classes"
                      value={c.classGroup}
                      onChange={(e) => {
                        const next = [...courses];
                        next[i] = { ...c, classGroup: e.target.value };
                        setCourses(next);
                      }}
                    />
                  </td>
                  <td className="p-1">
                    <select
                      className="input"
                      value={c.teacherId}
                      onChange={(e) => {
                        const next = [...courses];
                        next[i] = { ...c, teacherId: e.target.value };
                        setCourses(next);
                      }}
                    >
                      {teachers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-1">
                    <input
                      type="number"
                      min={1}
                      className="input w-20"
                      value={mode === "class" ? c.periodsPerWeek : c.durationPeriods ?? 1}
                      onChange={(e) => {
                        const v = Math.max(1, Number(e.target.value) || 1);
                        const next = [...courses];
                        next[i] = mode === "class" ? { ...c, periodsPerWeek: v } : { ...c, durationPeriods: v };
                        setCourses(next);
                      }}
                    />
                  </td>
                  <td className="p-1 text-center">
                    <input
                      type="checkbox"
                      checked={!!c.heavy}
                      onChange={(e) => {
                        const next = [...courses];
                        next[i] = { ...c, heavy: e.target.checked };
                        setCourses(next);
                      }}
                      aria-label="Prefer morning"
                    />
                  </td>
                  <td className="p-1">
                    <button
                      onClick={() => setCourses(courses.filter((x) => x.id !== c.id))}
                      className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
                      aria-label="Remove course"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <datalist id="nerdc-classes">
            {ALL_NERDC_CLASSES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
      </Section>

      {result && (
        <Section
          title="Generated timetable"
          action={
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              {result.stats.iterations} placements · {result.stats.ms}ms
              <select
                className="input ml-2"
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                aria-label="Filter by class"
              >
                <option value="">All classes</option>
                {classGroups.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>
          }
        >
          {result.unscheduled.length > 0 && (
            <div className="mb-3 flex items-start gap-2 rounded-xl bg-amber-100/60 p-3 text-sm text-amber-900">
              <AlertTriangle className="mt-0.5 h-4 w-4" />
              <div>
                <strong>{result.unscheduled.length}</strong> course(s) couldn't be placed:
                <ul className="list-disc pl-5">
                  {result.unscheduled.map((u) => (
                    <li key={u.courseId}>{u.reason}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-1 text-xs">
              <thead>
                <tr>
                  <th className="p-2 text-left text-muted-foreground">Period</th>
                  {days.map((d) => (
                    <th key={d} className="p-2 text-left text-muted-foreground">
                      {d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: periods }).map((_, p) => (
                  <tr key={p}>
                    <td className="p-2 font-semibold text-muted-foreground">P{p + 1}</td>
                    {days.map((_, d) => {
                      const cellSlots = visibleSlots.filter(
                        (s) => s.day === d && p >= s.period && p < s.period + s.span,
                      );
                      return (
                        <td key={d} className="rounded-lg bg-white/40 p-1 align-top">
                          {cellSlots.map((s) => {
                            const teacher = teachers.find((t) => t.id === s.teacherId)?.name;
                            const room = rooms.find((r) => r.id === s.roomId)?.name;
                            return (
                              <div
                                key={s.courseId + p + d}
                                className="rounded-md bg-gradient-to-br from-primary/20 to-secondary/20 px-2 py-1"
                              >
                                <div className="font-semibold">{s.subject}</div>
                                <div className="text-[10px] text-muted-foreground">
                                  {s.classGroup} · {teacher} · {room}
                                </div>
                              </div>
                            );
                          })}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}
    </div>
  );
}
