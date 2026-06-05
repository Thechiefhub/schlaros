import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/_app/assessments")({
  head: () => ({ meta: [{ title: "Assessments — TeacherGPT" }] }),
  component: () => <PlaceholderPage title="Assessments" />,
});
