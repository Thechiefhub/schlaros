import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/_app/seating-chart")({
  head: () => ({ meta: [{ title: "Seating Chart — TeacherGPT" }] }),
  component: () => <PlaceholderPage title="Seating Chart" />,
});
