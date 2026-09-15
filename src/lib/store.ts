// Lightweight client persistence layer + URL helpers.
// All data is stored in localStorage (no backend yet — wire to Lovable Cloud later).

export type Question = {
  q: string;
  options?: string[];
  answer: string;
  explanation?: string;
};

export type Assessment = {
  id: string;
  slug: string;
  title: string;
  subject: string;
  klass: string;
  topic: string;
  type: "Multiple Choice" | "True / False" | "Short Answer" | "Essay" | string;
  duration: number;
  questions: Question[];
  createdAt: string;
};

export type Submission = {
  id: string;
  assessmentId: string;
  assessmentTitle: string;
  klass: string;
  subject: string;
  studentName: string;
  studentEmail?: string;
  studentClass?: string;
  answers: string[];
  score?: number; // 0..100
  maxScore: number;
  autoGraded: boolean;
  needsReview: boolean;
  submittedAt: string;
};

const PUBLISHED_ORIGIN = "https://schlaros.lovable.app";

export function publicOrigin(): string {
  if (typeof window === "undefined") return PUBLISHED_ORIGIN;
  const o = window.location.origin;
  // Strip Lovable preview/sandbox prefixes so shared links point at the clean
  // published site rather than the editor preview host.
  if (/id-preview|sandbox\.lovable\.dev|--/.test(o)) return PUBLISHED_ORIGIN;
  return o;
}

export function shareUrl(path: string): string {
  return `${publicOrigin()}${path.startsWith("/") ? path : `/${path}`}`;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

export function uniqueSlug(base: string): string {
  const root = slugify(base) || "item";
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${root}-${suffix}`;
}

// ── Read/write helpers (SSR-safe) ──────────────────────────────────────────
export function readLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeLS<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

// ── Assessments ────────────────────────────────────────────────────────────
const A_KEY = "tg.assessments.v2";

export function getAssessments(): Assessment[] {
  return readLS<Assessment[]>(A_KEY, []);
}

export function saveAssessments(list: Assessment[]) {
  writeLS(A_KEY, list);
}

export function getAssessmentBySlug(slug: string): Assessment | undefined {
  return getAssessments().find((a) => a.slug === slug);
}

// ── Submissions ────────────────────────────────────────────────────────────
const S_KEY = "tg.submissions.v1";

export function getSubmissions(): Submission[] {
  return readLS<Submission[]>(S_KEY, []);
}

export function addSubmission(s: Submission) {
  const list = getSubmissions();
  writeLS(S_KEY, [s, ...list]);
}

export function updateSubmission(id: string, patch: Partial<Submission>) {
  const list = getSubmissions().map((x) => (x.id === id ? { ...x, ...patch } : x));
  writeLS(S_KEY, list);
}

export function gradeMCQ(
  assessment: Assessment,
  answers: string[],
): { score: number; correctCount: number } {
  let correct = 0;
  assessment.questions.forEach((q, i) => {
    if (!q.options) return;
    if ((answers[i] ?? "").trim() === (q.answer ?? "").trim()) correct += 1;
  });
  const total = assessment.questions.filter((q) => q.options).length || assessment.questions.length;
  return { score: Math.round((correct / total) * 100), correctCount: correct };
}

export function isMCQ(a: Assessment): boolean {
  return (
    a.questions.length > 0 &&
    a.questions.every((q) => Array.isArray(q.options) && q.options.length > 0)
  );
}

// ── User Sessions & Auth ──────────────────────────────────────────────────
export type UserRole = "admin" | "teacher" | "student" | "parent";

export type UserSession = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  school?: string;
  avatarUrl?: string;
  admissionNo?: string;
  klass?: string;
};

const SESSION_KEY = "schlaros.session.v1";

export function getSession(): UserSession | null {
  // If no session is saved yet, we default to Tolulope A. (Teacher) to preserve backwards-compatibility
  const session = readLS<UserSession | null>(SESSION_KEY, null);
  return session;
}

export function saveSession(session: UserSession | null): void {
  writeLS(SESSION_KEY, session);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("schlaros-auth-change"));
  }
}

