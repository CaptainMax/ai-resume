export const WORK_EXAMPLES_V2 = `
### Few-shot Examples for Work Experience (v2 Enhanced)

User: "Add a new work experience at Google as Senior Software Engineer from 03-2025 to Current"
Assistant:
{
  "action": {
    "type": "add_field",
    "data": {
      "sectionId": "section-1",
      "fieldName": "Google",
      "points": [
        "Position: Senior Software Engineer",
        "Date: Mar. 2025 - Current",
        "Description: Leading development of scalable cloud infrastructure solutions",
        "Responsibility: Architected microservices that handle 1M+ daily requests",
        "Responsibility: Mentored 3 junior developers and improved team productivity by 25%",
        "Achievement: Reduced system latency by 40% through optimization initiatives"
      ]
    }
  }
}

User: "Add work experience at Microsoft as Software Engineer from 2023 to 2024"
Assistant:
{
  "action": {
    "type": "add_field",
    "data": {
      "sectionId": "section-1",
      "fieldName": "Microsoft",
      "points": [
        "Position: Software Engineer",
        "Date: Jan. 2023 - Dec. 2024",
        "Description: Developed enterprise software solutions using C# and Azure",
        "Responsibility: Collaborated with cross-functional teams to deliver high-quality products",
        "Responsibility: Implemented CI/CD pipelines reducing deployment time by 60%",
        "Achievement: Led migration of legacy systems to cloud infrastructure"
      ]
    }
  }
}

User: "Add my internship at Apple as iOS Developer Intern from Summer 2022"
Assistant:
{
  "action": {
    "type": "add_field",
    "data": {
      "sectionId": "section-1",
      "fieldName": "Apple",
      "points": [
        "Position: iOS Developer Intern",
        "Date: Jun. 2022 - Aug. 2022",
        "Description: Developed iOS applications using Swift and SwiftUI",
        "Responsibility: Worked on user interface improvements and performance optimization",
        "Responsibility: Collaborated with senior engineers on feature development",
        "Achievement: Contributed to app that reached 100K+ downloads"
      ]
    }
  }
}

User: "Add work experience: Amazon, Software Development Engineer, 2021-2023"
Assistant:
{
  "action": {
    "type": "add_field",
    "data": {
      "sectionId": "section-1",
      "fieldName": "Amazon",
      "points": [
        "Position: Software Development Engineer",
        "Date: Jan. 2021 - Dec. 2023",
        "Description: Built distributed systems for e-commerce platform",
        "Responsibility: Designed and implemented microservices architecture",
        "Responsibility: Optimized database queries resulting in 40% performance improvement",
        "Achievement: Led team of 4 engineers in delivering critical system upgrades"
      ]
    }
  }
}
`;
