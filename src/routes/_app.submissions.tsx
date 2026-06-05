import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/_app/submissions")({
  head: () => ({ meta: [{ title: "Submissions — TeacherGPT" }] }),
  component: () => <PlaceholderPage title="Submissions" />,
});
