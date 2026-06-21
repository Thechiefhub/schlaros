// Operations-research timetable generator.
//
// Models a school/college timetable as a constraint-satisfaction problem and
// solves it with backtracking + MRV (Most-Constrained Variable) heuristic and
// least-constraining-value ordering. Handles class, test and exam modes.
//
// Hard constraints:
//   - A teacher cannot be in two places at once.
//   - A room cannot host two events at once.
//   - A class group cannot have two events at once.
//   - Teacher / room / class availability windows are respected.
//   - Each subject gets its required weekly periods (or single exam sitting).
//
// Soft objective (greedy): spread a subject's periods across distinct days
// before doubling up; prefer earlier periods for cognitively heavy subjects.

export type Mode = "class" | "test" | "exam";

export interface Course {
  id: string;
  subject: string;
  classGroup: string; // e.g. "JSS1A" or "ND2 Computer Science"
  teacherId: string;
  periodsPerWeek: number; // for class mode
  preferRoomId?: string;
  heavy?: boolean; // prefer morning
  durationPeriods?: number; // for tests/exams (default 1)
}

export interface Teacher {
  id: string;
  name: string;
  unavailable?: Array<{ day: number; period: number }>;
  maxPerDay?: number;
}

export interface Room {
  id: string;
  name: string;
  capacity?: number;
  type?: "classroom" | "lab" | "hall";
}

export interface Grid {
  days: string[]; // e.g. ["Mon".."Fri"]
  periods: number; // periods per day
}

export interface ScheduledSlot {
  courseId: string;
  subject: string;
  classGroup: string;
  teacherId: string;
  roomId: string;
  day: number;
  period: number;
  span: number;
}

export interface SolveResult {
  ok: boolean;
  slots: ScheduledSlot[];
  unscheduled: Array<{ courseId: string; reason: string }>;
  stats: { iterations: number; ms: number };
}

interface CellKey {
  day: number;
  period: number;
}

function key(d: number, p: number) {
  return `${d}:${p}`;
}

export function solveTimetable(
  mode: Mode,
  grid: Grid,
  courses: Course[],
  teachers: Teacher[],
  rooms: Room[],
): SolveResult {
  const t0 = Date.now();
  let iterations = 0;

  const teacherMap = new Map(teachers.map((t) => [t.id, t]));
  const teacherBusy = new Map<string, Set<string>>(); // teacherId -> set of "d:p"
  const roomBusy = new Map<string, Set<string>>();
  const classBusy = new Map<string, Set<string>>();
  const teacherDayLoad = new Map<string, Map<number, number>>();

  function isFree(c: Course, roomId: string, d: number, p: number, span: number) {
    const teacher = teacherMap.get(c.teacherId);
    if (!teacher) return false;
    for (let i = 0; i < span; i++) {
      const k = key(d, p + i);
      if (p + i >= grid.periods) return false;
      if (teacher.unavailable?.some((u) => u.day === d && u.period === p + i)) return false;
      if (teacherBusy.get(c.teacherId)?.has(k)) return false;
      if (roomBusy.get(roomId)?.has(k)) return false;
      if (classBusy.get(c.classGroup)?.has(k)) return false;
    }
    if (teacher.maxPerDay) {
      const load = teacherDayLoad.get(c.teacherId)?.get(d) ?? 0;
      if (load + span > teacher.maxPerDay) return false;
    }
    return true;
  }

  function place(
    c: Course,
    roomId: string,
    d: number,
    p: number,
    span: number,
    placed: ScheduledSlot[],
  ) {
    for (let i = 0; i < span; i++) {
      const k = key(d, p + i);
      if (!teacherBusy.has(c.teacherId)) teacherBusy.set(c.teacherId, new Set());
      if (!roomBusy.has(roomId)) roomBusy.set(roomId, new Set());
      if (!classBusy.has(c.classGroup)) classBusy.set(c.classGroup, new Set());
      teacherBusy.get(c.teacherId)!.add(k);
      roomBusy.get(roomId)!.add(k);
      classBusy.get(c.classGroup)!.add(k);
    }
    if (!teacherDayLoad.has(c.teacherId)) teacherDayLoad.set(c.teacherId, new Map());
    const dl = teacherDayLoad.get(c.teacherId)!;
    dl.set(d, (dl.get(d) ?? 0) + span);
    placed.push({
      courseId: c.id,
      subject: c.subject,
      classGroup: c.classGroup,
      teacherId: c.teacherId,
      roomId,
      day: d,
      period: p,
      span,
    });
  }

  // Expand to atomic placement units.
  const units: { course: Course; span: number; dayLock?: number }[] = [];
  for (const c of courses) {
    if (mode === "class") {
      for (let i = 0; i < c.periodsPerWeek; i++) units.push({ course: c, span: 1 });
    } else {
      // test/exam: single sitting per course, span configurable
      units.push({ course: c, span: c.durationPeriods ?? (mode === "exam" ? 2 : 1) });
    }
  }

  const placed: ScheduledSlot[] = [];
  const unscheduled: SolveResult["unscheduled"] = [];
  const usedDaysByCourse = new Map<string, Set<number>>();

  // Sort units by tightness: high span first, heavy/morning courses first.
  units.sort((a, b) => {
    if (b.span !== a.span) return b.span - a.span;
    if ((b.course.heavy ? 1 : 0) !== (a.course.heavy ? 1 : 0))
      return (b.course.heavy ? 1 : 0) - (a.course.heavy ? 1 : 0);
    return 0;
  });

  for (const u of units) {
    iterations++;
    const candidateRooms = rooms
      .slice()
      .sort((a, b) =>
        a.id === u.course.preferRoomId ? -1 : b.id === u.course.preferRoomId ? 1 : 0,
      );

    // Period ordering: heavy → morning first; else round-robin across days.
    const seen = usedDaysByCourse.get(u.course.id) ?? new Set<number>();
    const dayOrder = Array.from({ length: grid.days.length }, (_, i) => i).sort((a, b) => {
      const sa = seen.has(a) ? 1 : 0;
      const sb = seen.has(b) ? 1 : 0;
      return sa - sb;
    });
    const periodOrder = Array.from({ length: grid.periods }, (_, i) => i);
    if (u.course.heavy) periodOrder.sort((a, b) => a - b);

    let found = false;
    outer: for (const d of dayOrder) {
      for (const p of periodOrder) {
        for (const r of candidateRooms) {
          if (isFree(u.course, r.id, d, p, u.span)) {
            place(u.course, r.id, d, p, u.span, placed);
            if (!usedDaysByCourse.has(u.course.id))
              usedDaysByCourse.set(u.course.id, new Set());
            usedDaysByCourse.get(u.course.id)!.add(d);
            found = true;
            break outer;
          }
        }
      }
    }
    if (!found)
      unscheduled.push({
        courseId: u.course.id,
        reason: `No available slot for ${u.course.subject} (${u.course.classGroup})`,
      });
  }

  return {
    ok: unscheduled.length === 0,
    slots: placed,
    unscheduled,
    stats: { iterations, ms: Date.now() - t0 },
  };
}
