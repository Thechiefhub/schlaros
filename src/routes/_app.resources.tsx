import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/_app/resources")({
  head: () => ({ meta: [{ title: "Resources — SchlarOS" }] }),
  component: () => <PlaceholderPage title="Resources" />,
});
