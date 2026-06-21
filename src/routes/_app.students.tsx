import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";
import { CrudPage } from "@/components/crud-page";
import { CLASSES } from "@/lib/sample-data";

type Student = {
  id: string;
  name: string;
  admissionNo: string;
  klass: string;
  parentEmail?: string;
  gender?: string;
};

export const Route = createFileRoute("/_app/students")({
  head: () => ({ meta: [{ title: "Students — SchlarOS" }] }),
  component: () => (
    <CrudPage<Student>
      storageKey="tg.students"
      icon={GraduationCap}
      title="Students"
      description="School-wide student roster, admission records, and class assignments."
      itemNoun="Student"
      primaryKey="name"
      secondaryKey="admissionNo"
      fields={[
        { key: "name", label: "Full Name", required: true },
        { key: "admissionNo", label: "Admission No.", required: true, placeholder: "SCH/2026/001" },
        { key: "klass", label: "Class", type: "select", options: CLASSES, required: true, badge: true },
        { key: "gender", label: "Gender", type: "select", options: ["Male", "Female"], badge: true },
        { key: "parentEmail", label: "Parent Email", type: "email" },
      ]}
      initial={() => ({ name: "", admissionNo: "", klass: CLASSES[0], gender: "Male", parentEmail: "" })}
    />
  ),
});
