import { createFileRoute } from "@tanstack/react-router";
import { Building2 } from "lucide-react";
import { CrudPage } from "@/components/crud-page";

type Dept = { id: string; name: string; head: string; description?: string };

export const Route = createFileRoute("/_app/departments")({
  head: () => ({ meta: [{ title: "Departments — SchlarOS" }] }),
  component: () => (
    <CrudPage<Dept>
      storageKey="tg.departments"
      icon={Building2}
      title="Departments"
      description="Academic departments and their heads."
      itemNoun="Department"
      primaryKey="name"
      secondaryKey="head"
      fields={[
        { key: "name", label: "Department", required: true, placeholder: "Sciences" },
        { key: "head", label: "Head of Department", required: true },
        { key: "description", label: "Description", type: "textarea" },
      ]}
      initial={() => ({ name: "", head: "", description: "" })}
      seed={[
        { id: "d1", name: "Sciences", head: "Mr. Chinedu Okafor", description: "Physics, Chemistry, Biology" },
        { id: "d2", name: "Humanities", head: "Mrs. Funke Adesuwa", description: "Literature, History, CRS" },
      ]}
    />
  ),
});
