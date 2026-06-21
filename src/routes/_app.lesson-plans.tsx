import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/_app/lesson-plans")({
  head: () => ({ meta: [{ title: "Lesson Plans — SchlarOS" }] }),
  component: () => <PlaceholderPage title="Lesson Plans" />,
});
