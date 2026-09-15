import { createFileRoute } from "@tanstack/react-router";
import { Briefcase } from "lucide-react";
import { CrudPage } from "@/components/crud-page";
import { SUBJECTS } from "@/lib/sample-data";

type Teacher = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  role: string;
};

export const Route = createFileRoute("/_app/teachers")({
  head: () => ({ meta: [{ title: "Teachers — SchlarOS" }] }),
  component: () => (
    <CrudPage<Teacher>
      storageKey="tg.teachers"
      icon={Briefcase}
      title="Teachers"
      description="Manage teaching staff, departments, and assignments."
      itemNoun="Teacher"
      primaryKey="name"
      secondaryKey="email"
      fields={[
        { key: "name", label: "Full Name", required: true, placeholder: "e.g. Mrs. Adesuwa Bello" },
        {
          key: "email",
          label: "Email",
          type: "email",
          required: true,
          placeholder: "name@school.edu",
        },
        { key: "phone", label: "Phone", type: "tel", placeholder: "+234…" },
        {
          key: "subject",
          label: "Primary Subject",
          type: "select",
          options: SUBJECTS,
          badge: true,
        },
        {
          key: "role",
          label: "Role",
          type: "select",
          options: [
            "Class Teacher",
            "Subject Teacher",
            "Head of Department",
            "Principal",
            "Vice Principal",
          ],
          badge: true,
        },
      ]}
      initial={() => ({
        name: "",
        email: "",
        phone: "",
        subject: SUBJECTS[0],
        role: "Subject Teacher",
      })}
      seed={[
        {
          id: "t1",
          name: "Mrs. Adesuwa Bello",
          email: "adesuwa@school.edu",
          phone: "+2348012345678",
          subject: "Mathematics",
          role: "Head of Department",
        },
        {
          id: "t2",
          name: "Mr. Chinedu Okafor",
          email: "chinedu@school.edu",
          phone: "+2348098765432",
          subject: "Physics",
          role: "Subject Teacher",
        },
      ]}
    />
  ),
});
