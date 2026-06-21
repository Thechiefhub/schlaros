import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/_app/weekly-bundle")({
  head: () => ({ meta: [{ title: "Weekly Bundle — SchlarOS" }] }),
  component: () => <PlaceholderPage title="Weekly Bundle" />,
});
