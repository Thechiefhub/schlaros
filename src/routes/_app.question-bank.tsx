import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/_app/question-bank")({
  head: () => ({ meta: [{ title: "Question Bank — TeacherGPT" }] }),
  component: () => <PlaceholderPage title="Question Bank" />,
});
