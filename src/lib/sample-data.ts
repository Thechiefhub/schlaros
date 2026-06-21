import { ALL_NERDC_CLASSES, ALL_NERDC_SUBJECTS } from "@/lib/nerdc-curriculum";

export const CLASSES = ALL_NERDC_CLASSES;
export const SUBJECTS = ALL_NERDC_SUBJECTS;
export const TERMS = ["First Term", "Second Term", "Third Term"];

export const SAMPLE_STUDENTS: Record<string, string[]> = {
  JSS1: ["Ada Lovelace", "Tunde Bakare", "Chioma Eze", "Kunle Adebayo", "Fatima Bello", "Emeka Okafor", "Aisha Yusuf", "David Okon", "Ngozi Umeh", "Bola Adeniyi"],
  JSS2: ["Zainab Hassan", "Chinedu Obi", "Grace Etim", "Yusuf Ali", "Ruth Mensah", "Samuel Idris"],
  JSS3: ["Daniel Kuti", "Hauwa Garba", "Ibrahim Sule", "Patience Eze"],
  SS1: ["Olu Adigun", "Rita Onyeka", "Bashir Musa", "Funke Ade"],
  SS2: ["Adaeze Obi", "Tope Lawal", "Kemi Sule"],
  SS3: ["Wale Banks", "Nneka Eze", "Ife Cole"],
};

export function studentsFor(cls: string): string[] {
  return SAMPLE_STUDENTS[cls] ?? [];
}
