export const CLASSES = ["JSS1A", "JSS1B", "JSS2A", "JSS2B", "JSS3A", "SS1A", "SS2A", "SS3A"];
export const SUBJECTS = [
  "Mathematics",
  "English Language",
  "Basic Science",
  "Social Studies",
  "Civic Education",
  "Computer Science",
  "Physics",
  "Chemistry",
  "Biology",
  "Literature",
];
export const TERMS = ["First Term", "Second Term", "Third Term"];

export const SAMPLE_STUDENTS: Record<string, string[]> = {
  JSS1A: ["Ada Lovelace", "Tunde Bakare", "Chioma Eze", "Kunle Adebayo", "Fatima Bello", "Emeka Okafor", "Aisha Yusuf", "David Okon", "Ngozi Umeh", "Bola Adeniyi"],
  JSS1B: ["Ifeoma Nwosu", "Sade Johnson", "Musa Garba", "Peter Eze", "Lola Adeola", "Tobi Ade", "Halima Sani", "Femi Cole"],
  JSS2A: ["Zainab Hassan", "Chinedu Obi", "Grace Etim", "Yusuf Ali", "Ruth Mensah", "Samuel Idris"],
  JSS2B: ["Joy Okolie", "Ahmed Lawal", "Esther Bassey", "John Ude", "Mary Akin"],
  JSS3A: ["Daniel Kuti", "Hauwa Garba", "Ibrahim Sule", "Patience Eze"],
  SS1A: ["Olu Adigun", "Rita Onyeka", "Bashir Musa", "Funke Ade"],
  SS2A: ["Adaeze Obi", "Tope Lawal", "Kemi Sule"],
  SS3A: ["Wale Banks", "Nneka Eze", "Ife Cole"],
};

export function studentsFor(cls: string): string[] {
  return SAMPLE_STUDENTS[cls] ?? [];
}
