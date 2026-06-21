import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/_app/my-tasks")({
  head: () => ({ meta: [{ title: "My Tasks — SchlarOS" }] }),
  component: () => <PlaceholderPage title="My Tasks" />,
});
