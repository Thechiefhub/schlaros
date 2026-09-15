import { createFileRoute } from "@tanstack/react-router";
import { CalendarRange } from "lucide-react";
import { CrudPage } from "@/components/crud-page";

type Session = { id: string; name: string; startDate: string; endDate: string; status: string };

export const Route = createFileRoute("/_app/academic-sessions")({
  head: () => ({ meta: [{ title: "Academic Sessions — SchlarOS" }] }),
  component: () => (
    <CrudPage<Session>
      storageKey="tg.sessions"
      icon={CalendarRange}
      title="Academic Sessions"
      description="Define academic years and terms."
      itemNoun="Session"
      primaryKey="name"
      secondaryKey="status"
      fields={[
        {
          key: "name",
          label: "Session Name",
          required: true,
          placeholder: "2025/2026 — First Term",
        },
        { key: "startDate", label: "Start Date", type: "date", required: true },
        { key: "endDate", label: "End Date", type: "date", required: true },
        {
          key: "status",
          label: "Status",
          type: "select",
          options: ["Upcoming", "Active", "Completed"],
          badge: true,
        },
      ]}
      initial={() => ({ name: "", startDate: "", endDate: "", status: "Upcoming" })}
    />
  ),
});
