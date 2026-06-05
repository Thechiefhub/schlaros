import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/_app/parent-access")({
  head: () => ({ meta: [{ title: "Parent Access — TeacherGPT" }] }),
  component: () => <PlaceholderPage title="Parent Access" />,
});
