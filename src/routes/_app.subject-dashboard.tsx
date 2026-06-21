import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/_app/subject-dashboard")({
  head: () => ({ meta: [{ title: "Subject Dashboard — SchlarOS" }] }),
  component: () => <PlaceholderPage title="Subject Dashboard" />,
});
