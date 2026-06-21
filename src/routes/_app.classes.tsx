import { createFileRoute } from "@tanstack/react-router";
import { Layers } from "lucide-react";
import { CrudPage } from "@/components/crud-page";

type Klass = {
  id: string;
  name: string;
  level: string;
  formTeacher: string;
  capacity: number;
};

export const Route = createFileRoute("/_app/classes")({
  head: () => ({ meta: [{ title: "Classes — SchlarOS" }] }),
  component: () => (
    <CrudPage<Klass>
      storageKey="tg.classes"
      icon={Layers}
      title="Classes"
      description="Manage class arms, form teachers, and capacity."
      itemNoun="Class"
      primaryKey="name"
      secondaryKey="formTeacher"
      fields={[
        { key: "name", label: "Class Name", required: true, placeholder: "JSS 1A" },
        { key: "level", label: "Level", type: "select", options: ["JSS", "SSS"], required: true, badge: true },
        { key: "formTeacher", label: "Form Teacher", required: true },
        { key: "capacity", label: "Capacity", type: "number" },
      ]}
      initial={() => ({ name: "", level: "JSS", formTeacher: "", capacity: 30 })}
    />
  ),
});
