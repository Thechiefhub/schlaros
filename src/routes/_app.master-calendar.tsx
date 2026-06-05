import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/_app/master-calendar")({
  head: () => ({ meta: [{ title: "Master Calendar — TeacherGPT" }] }),
  component: () => <PlaceholderPage title="Master Calendar" />,
});
