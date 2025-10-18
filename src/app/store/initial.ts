import { ResumeSection } from "./types";

export const initialSections: ResumeSection[] = [
  {
    id: "header",
    title: "Header",
    fields: [
      { id: "f1", name: "Full Name", value: "Jian Ma" },
      { id: "f2", name: "Phone", value: "123-456-7890" },
      { id: "f3", name: "Email", value: "jian@example.com" },
      { id: "f4", name: "Portfolio", value: "https://maxonboard.com" },
    ],
  },
  {
    id: "summary",
    title: "Summary",
    fields: [
      {
        id: "f5",
        name: "Summary",
        value: "Backend developer with 4+ years of experience building scalable systems.",
      },
    ],
  },
  {
    id: "skills",
    title: "Skills",
    fields: [
      {
        id: "f6",
        name: "Backend",
        points: [
          { id: "p1", content: "Java" },
          { id: "p2", content: "Spring Boot" },
          { id: "p3", content: "Docker" },
        ],
      },
      {
        id: "f7",
        name: "Frontend",
        points: [
          { id: "p4", content: "React" },
          { id: "p5", content: "Angular" },
        ],
      },
    ],
  },
  {
    id: "work",
    title: "Work Experience",
    fields: [
      { id: "f8", name: "Company Name", value: "Apple" },
      { id: "f9", name: "Job Title", value: "Backend Engineer" },
      { id: "f10", name: "Timeframe", value: "2022–2024" },
      {
        id: "f11",
        name: "Responsibilities",
        points: [
          { id: "p6", content: "Improved upload speed by 90%" },
          { id: "p7", content: "Led cross-team debugging sessions" },
        ],
      },
    ],
  },
  {
    id: "projects",
    title: "Projects",
    fields: [
      { id: "f12", name: "Project Name", value: "Resume Builder App" },
      {
        id: "f13",
        name: "Highlights",
        points: [
          { id: "p8", content: "Implemented drag-and-drop resume editor" },
          { id: "p9", content: "Integrated AI to optimize content" },
        ],
      },
    ],
  },
  {
    id: "education",
    title: "Education",
    fields: [
      { id: "f14", name: "School", value: "University of Texas at Arlington" },
      { id: "f15", name: "Degree", value: "B.S. in Computer Science" },
      { id: "f16", name: "Years", value: "2017 – 2020" },
    ],
  },
];
