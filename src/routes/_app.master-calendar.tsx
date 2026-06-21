import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/_app/master-calendar")({
  head: () => ({ meta: [{ title: "Master Calendar — SchlarOS" }] }),
  component: () => <PlaceholderPage title="Master Calendar" />,
});
