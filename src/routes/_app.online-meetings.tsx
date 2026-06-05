import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/_app/online-meetings")({
  head: () => ({ meta: [{ title: "Online Meetings — TeacherGPT" }] }),
  component: () => <PlaceholderPage title="Online Meetings" />,
});
