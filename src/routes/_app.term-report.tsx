import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/_app/term-report")({
  head: () => ({ meta: [{ title: "Term Report — SchlarOS" }] }),
  component: () => <PlaceholderPage title="Term Report" />,
});
