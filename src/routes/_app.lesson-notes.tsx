import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/_app/lesson-notes")({
  head: () => ({ meta: [{ title: "Lesson Notes — SchlarOS" }] }),
  component: () => <PlaceholderPage title="Lesson Notes" />,
});
