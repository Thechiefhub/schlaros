import { createFileRoute } from "@tanstack/react-router";
import { BookMarked, ExternalLink } from "lucide-react";
import { PageHeader, Section } from "@/components/page-header";
import { NERDC_LEVELS, NERDC_URL } from "@/lib/nerdc-curriculum";

export const Route = createFileRoute("/_app/curriculum")({
  head: () => ({ meta: [{ title: "NERDC Curriculum — SchlarOS" }] }),
  component: CurriculumPage,
});

function CurriculumPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        icon={BookMarked}
        title="NERDC Curriculum"
        description="The official curriculum framework that drives every lesson note, assessment and timetable in SchlarOS."
        actions={
          <a
            href={NERDC_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-white/70 px-3 py-2 text-sm font-semibold backdrop-blur"
          >
            Visit NERDC <ExternalLink className="h-3.5 w-3.5" />
          </a>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        {NERDC_LEVELS.map((lvl) => (
          <Section key={lvl.id} title={lvl.label}>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {lvl.classes.map((c) => (
                <span
                  key={c}
                  className="rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 px-2.5 py-0.5 text-xs font-semibold"
                >
                  {c}
                </span>
              ))}
            </div>
            <ul className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-2">
              {lvl.subjects.map((s) => (
                <li key={s} className="rounded-lg bg-white/40 px-2 py-1">
                  {s}
                </li>
              ))}
            </ul>
          </Section>
        ))}
      </div>

      <Section title="Why this matters">
        <p className="text-sm text-muted-foreground">
          The Nigerian Educational Research and Development Council (NERDC) publishes the national
          curriculum used across Basic and Senior Secondary education. SchlarOS sources all subject
          lists, class levels and lesson-note prompts from the structure above so your work stays
          aligned with the new NERDC curriculum out of the box.
        </p>
      </Section>
    </div>
  );
}
