import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock } from "lucide-react";
import { PlaceholderPage } from "@/components/placeholder-page";

// Same admin-level surface as /timetables — alias kept so school-management menu links resolve.
export const Route = createFileRoute("/_app/timetable-management")({
  head: () => ({ meta: [{ title: "Timetable Management — TeacherGPT" }] }),
  component: () => (
    <PlaceholderPage
      title="Timetable Management"
      description="Bulk timetable workflows — open Timetables to edit a single class schedule. Master timetable conflict-checking coming next."
    />
  ),
});
