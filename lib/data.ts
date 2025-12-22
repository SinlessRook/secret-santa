// lib/data.ts

export interface Student {
  name: string;
  email: string;
}

export const STUDENT_LIST: Student[] = [
  { name: "Alice Johnson", email: "aliceJ@example.com"},
  { name: "Bob Smith", email: "bobS@example.com" },
  { name: "Charlie Brown", email: "charlieB@example.com" },
  { name: "Diana Prince", email: "dianaP@example.com" },
  { name: "Ethan Hunt", email: "ethanH@example.com" },
];