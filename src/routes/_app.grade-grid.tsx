import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/_app/grade-grid")({
  head: () => ({ meta: [{ title: "Grade Grid — TeacherGPT" }] }),
  component: () => <PlaceholderPage title="Grade Grid" />,
});
