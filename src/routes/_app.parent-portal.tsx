import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/_app/parent-portal")({
  head: () => ({ meta: [{ title: "Parent Portal — TeacherGPT" }] }),
  component: () => <PlaceholderPage title="Parent Portal" />,
});
