import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/_app/student-summary")({
  head: () => ({ meta: [{ title: "Student Summary — SchlarOS" }] }),
  component: () => <PlaceholderPage title="Student Summary" />,
});
