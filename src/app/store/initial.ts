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
  {
    id: "certifications",
    title: "Certifications/Awards",
    fields: [
      {
        id: "f17",
        name: "AWS Certified Solutions Architect",
        points: [
          { id: "p10", content: "Issued: 2023" },
          { id: "p11", content: "Credential ID: AWS-CSA-123456" },
        ],
      },
      {
        id: "f18",
        name: "Google Cloud Professional Developer",
        points: [
          { id: "p12", content: "Issued: 2022" },
          { id: "p13", content: "Valid until: 2025" },
        ],
      },
    ],
  },
  {
    id: "languages",
    title: "Languages",
    fields: [
      {
        id: "f19",
        name: "English",
        value: "Native",
      },
      {
        id: "f20",
        name: "Chinese (Mandarin)",
        value: "Native",
      },
      {
        id: "f21",
        name: "Spanish",
        value: "Intermediate",
      },
    ],
  },
  {
    id: "volunteer",
    title: "Volunteer/Leadership",
    fields: [
      {
        id: "f22",
        name: "Tech for Good Volunteer",
        points: [
          { id: "p14", content: "Organization: Code for America" },
          { id: "p15", content: "Duration: 2022 - Present" },
          { id: "p16", content: "Role: Lead Developer for civic tech projects" },
        ],
      },
      {
        id: "f23",
        name: "University Coding Club President",
        points: [
          { id: "p17", content: "Institution: University of Texas at Arlington" },
          { id: "p18", content: "Duration: 2018 - 2020" },
          { id: "p19", content: "Led 50+ members in coding competitions and workshops" },
        ],
      },
    ],
  },
  {
    id: "portfolio",
    title: "Portfolio/Publications",
    fields: [
      {
        id: "f24",
        name: "GitHub Portfolio",
        value: "https://github.com/jianma",
      },
      {
        id: "f25",
        name: "Personal Website",
        value: "https://maxonboard.com",
      },
      {
        id: "f26",
        name: "Publications",
        points: [
          { id: "p20", content: "Machine Learning in Resume Optimization, IEEE Conference 2023" },
          { id: "p21", content: "Scalable Backend Architecture Patterns, Medium Article 2022" },
        ],
      },
    ],
  },
];
