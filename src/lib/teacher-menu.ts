import { GraduationCap, LayoutDashboard, FileText, BookOpen, ClipboardList, Database, BarChart3, FolderOpen, CheckSquare, UserCheck, Bot, BookMarked, UserCircle, Package, ListTodo, Grid3x3, FileBarChart, Video, Armchair, Calendar, Users, KeyRound, Inbox } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type MenuItem = {
  to: string;
  label: string;
  icon: LucideIcon;
};

export const MENU: MenuItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/lesson-notes", label: "Lesson Notes", icon: FileText },
  { to: "/lesson-plans", label: "Lesson Plans", icon: BookOpen },
  { to: "/assessments", label: "Assessments", icon: ClipboardList },
  { to: "/question-bank", label: "Question Bank", icon: Database },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/resources", label: "Resources", icon: FolderOpen },
  { to: "/bulk-grading", label: "Bulk Grading", icon: CheckSquare },
  { to: "/attendance", label: "Attendance", icon: UserCheck },
  { to: "/ai-assistant", label: "AI Assistant", icon: Bot },
  { to: "/subject-dashboard", label: "Subject Dashboard", icon: BookMarked },
  { to: "/student-summary", label: "Student Summary", icon: UserCircle },
  { to: "/weekly-bundle", label: "Weekly Bundle", icon: Package },
  { to: "/my-tasks", label: "My Tasks", icon: ListTodo },
  { to: "/grade-grid", label: "Grade Grid", icon: Grid3x3 },
  { to: "/term-report", label: "Term Report", icon: FileBarChart },
  { to: "/online-meetings", label: "Online Meetings", icon: Video },
  { to: "/seating-chart", label: "Seating Chart", icon: Armchair },
  { to: "/master-calendar", label: "Master Calendar", icon: Calendar },
  { to: "/parent-portal", label: "Parent Portal", icon: Users },
  { to: "/parent-access", label: "Parent Access", icon: KeyRound },
  { to: "/submissions", label: "Submissions", icon: Inbox },
];

export const APP_BRAND = {
  name: "TeacherGPT",
  tagline: "Teach More Impact",
  icon: GraduationCap,
};
