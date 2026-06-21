import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { CrudPage } from "@/components/crud-page";

type Parent = { id: string; name: string; email: string; phone: string; child: string; relationship: string };

export const Route = createFileRoute("/_app/parent-management")({
  head: () => ({ meta: [{ title: "Parent Management — SchlarOS" }] }),
  component: () => (
    <CrudPage<Parent>
      storageKey="tg.parents"
      icon={Users}
      title="Parent Management"
      description="Parent / guardian contact directory linked to their wards."
      itemNoun="Parent"
      primaryKey="name"
      secondaryKey="email"
      fields={[
        { key: "name", label: "Parent / Guardian Name", required: true },
        { key: "email", label: "Email", type: "email", required: true },
        { key: "phone", label: "Phone", type: "tel" },
        { key: "child", label: "Ward (Student Name)", required: true },
        { key: "relationship", label: "Relationship", type: "select", options: ["Father", "Mother", "Guardian"], badge: true },
      ]}
      initial={() => ({ name: "", email: "", phone: "", child: "", relationship: "Father" })}
    />
  ),
});
