// NERDC (Nigerian Educational Research and Development Council) curriculum
// reference. Source: https://www.nerdc.gov.ng — Revised 9-Year Basic Education
// Curriculum (BEC) and the Senior Secondary Education Curriculum (SSEC).
//
// This module is the single source of truth for subjects, levels, and themes
// shown across SchlarOS so every lesson note, assessment and timetable is
// curriculum-aligned for Nigerian schools.

export const NERDC_URL = "https://www.nerdc.gov.ng";

export type NERDCLevel = {
  id: string;
  label: string;
  classes: string[];
  subjects: string[];
};

export const NERDC_LEVELS: NERDCLevel[] = [
  {
    id: "lower-basic",
    label: "Lower Basic (Primary 1–3)",
    classes: ["Pry 1", "Pry 2", "Pry 3"],
    subjects: [
      "English Studies",
      "Mathematics",
      "Basic Science and Technology",
      "Religion and National Values",
      "Cultural and Creative Arts",
      "Nigerian Language",
      "Pre-Vocational Studies",
      "Arabic Language (Optional)",
    ],
  },
  {
    id: "middle-basic",
    label: "Middle Basic (Primary 4–6)",
    classes: ["Pry 4", "Pry 5", "Pry 6"],
    subjects: [
      "English Studies",
      "Mathematics",
      "Basic Science and Technology",
      "Religion and National Values",
      "Cultural and Creative Arts",
      "Nigerian Language",
      "Pre-Vocational Studies",
      "French",
      "Arabic Language (Optional)",
    ],
  },
  {
    id: "upper-basic",
    label: "Upper Basic (JSS 1–3)",
    classes: ["JSS1", "JSS2", "JSS3"],
    subjects: [
      "English Studies",
      "Mathematics",
      "Basic Science and Technology",
      "Religion and National Values",
      "Cultural and Creative Arts",
      "Business Studies",
      "Nigerian Language",
      "French",
      "Pre-Vocational Studies (Agric / Home Econs)",
      "Computer Studies / ICT",
      "Arabic Language (Optional)",
    ],
  },
  {
    id: "senior-secondary",
    label: "Senior Secondary (SS 1–3)",
    classes: ["SS1", "SS2", "SS3"],
    subjects: [
      // Cross-cutting core
      "English Language",
      "Mathematics",
      "Civic Education",
      "Trade / Entrepreneurship",
      "Computer Studies",
      // Science
      "Biology",
      "Chemistry",
      "Physics",
      "Further Mathematics",
      "Agricultural Science",
      // Arts/Humanities
      "Literature-in-English",
      "Government",
      "History",
      "Christian Religious Studies",
      "Islamic Studies",
      "Geography",
      "Visual Art",
      "Music",
      // Commercial
      "Economics",
      "Financial Accounting",
      "Commerce",
      "Marketing",
      "Office Practice",
    ],
  },
];

export const ALL_NERDC_SUBJECTS: string[] = Array.from(
  new Set(NERDC_LEVELS.flatMap((l) => l.subjects)),
).sort();

export const ALL_NERDC_CLASSES: string[] = NERDC_LEVELS.flatMap((l) => l.classes);

export function subjectsForClass(cls: string): string[] {
  return NERDC_LEVELS.find((l) => l.classes.includes(cls))?.subjects ?? [];
}

export function levelForClass(cls: string): NERDCLevel | undefined {
  return NERDC_LEVELS.find((l) => l.classes.includes(cls));
}
