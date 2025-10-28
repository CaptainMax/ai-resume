export const WORK_EXAMPLES = `
### Few-shot Examples for Work Experience

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
        "Description: Leading development of scalable cloud infrastructure solutions"
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
        "Date: 2023 - 2024",
        "Description: Developed enterprise software solutions using C# and Azure",
        "Responsibility: Collaborated with cross-functional teams to deliver high-quality products"
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
        "Date: Summer 2022",
        "Description: Developed iOS applications using Swift and SwiftUI",
        "Responsibility: Worked on user interface improvements and performance optimization"
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
        "Date: 2021 - 2023",
        "Description: Built distributed systems for e-commerce platform",
        "Responsibility: Designed and implemented microservices architecture",
        "Responsibility: Optimized database queries resulting in 40% performance improvement"
      ]
    }
  }
}
`;
