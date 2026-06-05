import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/_app/bulk-grading")({
  head: () => ({ meta: [{ title: "Bulk Grading — TeacherGPT" }] }),
  component: () => <PlaceholderPage title="Bulk Grading" />,
});
