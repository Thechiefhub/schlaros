import {
  GraduationCap,
  LayoutDashboard,
  FileText,
  BookOpen,
  ClipboardList,
  Database,
  BarChart3,
  FolderOpen,
  CheckSquare,
  UserCheck,
  Bot,
  BookMarked,
  UserCircle,
  Package,
  ListTodo,
  Grid3x3,
  FileBarChart,
  Video,
  Armchair,
  Calendar,
  Users,
  KeyRound,
  Inbox,
  Rocket,
  School,
  Globe2,
  Sparkles,
  Building2,
  CalendarRange,
  Layers,
  PieChart,
  Briefcase,
  CalendarClock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type MenuItem = {
  to?: string;
  label: string;
  icon: LucideIcon;
  comingSoon?: boolean;
};

export type MenuSection = {
  id: string;
  label: string;
  emoji: string;
  icon: LucideIcon;
  accent: string; // tailwind gradient classes
  items: MenuItem[];
  defaultOpen?: boolean;
  roles?: Array<"teacher" | "admin" | "parent" | "student">;
};

export const SECTIONS: MenuSection[] = [
  {
    id: "core",
    label: "Core Hub",
    emoji: "🚀",
    icon: Rocket,
    accent: "from-indigo-500 to-violet-500",
    defaultOpen: true,
    roles: ["teacher", "admin"],
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/ai-assistant", label: "AI Assistant", icon: Bot },
    ],
  },
  {
    id: "instruction",
    label: "Instructional Design",
    emoji: "📚",
    icon: BookOpen,
    accent: "from-fuchsia-500 to-pink-500",
    defaultOpen: true,
    roles: ["teacher", "admin"],
    items: [
      { to: "/lesson-plans", label: "Lesson Plans", icon: BookOpen },
      { to: "/lesson-notes", label: "Lesson Notes", icon: FileText },
      { to: "/assessments", label: "Assessments", icon: ClipboardList },
      { to: "/question-bank", label: "Question Bank", icon: Database },
    ],
  },
  {
    id: "classroom",
    label: "Classroom Operations",
    emoji: "🏫",
    icon: School,
    accent: "from-amber-500 to-orange-500",
    roles: ["teacher", "admin"],
    items: [
      { label: "Timetables", icon: CalendarClock, comingSoon: true },
      { to: "/attendance", label: "Attendance", icon: UserCheck },
      { to: "/seating-chart", label: "Seating Chart", icon: Armchair },
      { to: "/my-tasks", label: "My Tasks", icon: ListTodo },
      { to: "/bulk-grading", label: "Bulk Grading", icon: CheckSquare },
      { to: "/grade-grid", label: "Grade Grid", icon: Grid3x3 },
      { to: "/submissions", label: "Submissions", icon: Inbox },
    ],
  },
  {
    id: "insight",
    label: "Insight & Analytics",
    emoji: "📊",
    icon: BarChart3,
    accent: "from-cyan-500 to-sky-500",
    roles: ["teacher", "admin"],
    items: [
      { to: "/analytics", label: "Analytics", icon: BarChart3 },
      { to: "/student-summary", label: "Student Summary", icon: UserCircle },
      { to: "/subject-dashboard", label: "Subject Dashboard", icon: BookMarked },
      { to: "/term-report", label: "Term Report", icon: FileBarChart },
    ],
  },
  {
    id: "resources",
    label: "Resources & Admin",
    emoji: "📂",
    icon: FolderOpen,
    accent: "from-emerald-500 to-teal-500",
    roles: ["teacher", "admin"],
    items: [
      { to: "/resources", label: "Resources", icon: FolderOpen },
      { to: "/weekly-bundle", label: "Weekly Bundle", icon: Package },
    ],
  },
  {
    id: "community",
    label: "Meetings & Community",
    emoji: "🌐",
    icon: Globe2,
    accent: "from-rose-500 to-fuchsia-500",
    roles: ["teacher", "admin", "parent"],
    items: [
      { to: "/online-meetings", label: "Online Meetings", icon: Video },
      { to: "/master-calendar", label: "Master Calendar", icon: Calendar },
      { to: "/parent-access", label: "Parent Access", icon: KeyRound },
      { to: "/parent-portal", label: "Parent Portal", icon: Users },
    ],
  },
  {
    id: "school",
    label: "School Management",
    emoji: "🏢",
    icon: Building2,
    accent: "from-slate-500 to-zinc-600",
    roles: ["admin"],
    items: [
      { label: "Teachers", icon: Briefcase, comingSoon: true },
      { label: "Students", icon: GraduationCap, comingSoon: true },
      { label: "Classes", icon: Layers, comingSoon: true },
      { label: "Departments", icon: Building2, comingSoon: true },
      { label: "Subjects", icon: BookMarked, comingSoon: true },
      { label: "Academic Sessions", icon: CalendarRange, comingSoon: true },
      { label: "Timetable Management", icon: CalendarClock, comingSoon: true },
      { label: "Parent Management", icon: Users, comingSoon: true },
      { label: "School Analytics", icon: PieChart, comingSoon: true },
    ],
  },
];

// Flat list for backwards compat / lookups
export const MENU: MenuItem[] = SECTIONS.flatMap((s) => s.items).filter((i) => i.to);

export const APP_BRAND = {
  name: "TeacherGPT",
  tagline: "AI School OS",
  icon: GraduationCap,
};

export const QUICK_ACTIONS: { label: string; to: string; icon: LucideIcon }[] = [
  { label: "Lesson Note", to: "/lesson-notes", icon: FileText },
  { label: "Lesson Plan", to: "/lesson-plans", icon: BookOpen },
  { label: "Assessment", to: "/assessments", icon: ClipboardList },
  { label: "Question Bank", to: "/question-bank", icon: Database },
  { label: "Meeting", to: "/online-meetings", icon: Video },
  { label: "Task", to: "/my-tasks", icon: ListTodo },
];

export const SPARKLES_ICON = Sparkles;
