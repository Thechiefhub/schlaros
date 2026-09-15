import { createFileRoute } from "@tanstack/react-router";
import { BookMarked } from "lucide-react";
import { CrudPage } from "@/components/crud-page";

type Subject = { id: string; name: string; code: string; department: string; level: string };

export const Route = createFileRoute("/_app/subjects")({
  head: () => ({ meta: [{ title: "Subjects — SchlarOS" }] }),
  component: () => (
    <CrudPage<Subject>
      storageKey="tg.subjects"
      icon={BookMarked}
      title="Subjects"
      description="Curriculum-wide subject catalogue."
      itemNoun="Subject"
      primaryKey="name"
      secondaryKey="code"
      fields={[
        { key: "name", label: "Subject Name", required: true },
        { key: "code", label: "Code", required: true, placeholder: "MTH101" },
        {
          key: "department",
          label: "Department",
          type: "select",
          options: ["Sciences", "Humanities", "Arts", "Commercial", "Languages"],
          badge: true,
        },
        {
          key: "level",
          label: "Level",
          type: "select",
          options: ["JSS", "SSS", "Both"],
          badge: true,
        },
      ]}
      initial={() => ({ name: "", code: "", department: "Sciences", level: "Both" })}
    />
  ),
});
