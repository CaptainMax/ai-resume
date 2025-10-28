export const BASE_EXAMPLES_V2 = `
### Few-shot Examples for Base Operations (v2 Enhanced)

User: "Add a new education entry: MIT, 2021-2023, M.S. Computer Science"
Assistant:
{
  "action": {
    "type": "add_field",
    "data": {
      "sectionId": "section-6",
      "fieldName": "Massachusetts Institute of Technology",
      "points": [
        "Location: Cambridge, MA",
        "Date: 2021 - 2023",
        "Degree: M.S. Computer Science",
        "GPA: 3.9/4.0",
        "Relevant Coursework: Machine Learning, Data Structures, Algorithms"
      ]
    }
  }
}

User: "Add a work experience at Google as Senior Software Engineer from 03-2025 to Current"
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
        "Responsibility: Mentored 3 junior developers and improved team productivity by 25%"
      ]
    }
  }
}

User: "Add a new point to my current work experience: Led a team of 5 developers"
Assistant:
{
  "action": {
    "type": "add_point",
    "data": {
      "sectionId": "section-1",
      "fieldId": "field-1-0",
      "content": "Led a cross-functional team of 5 developers in agile development process, delivering 15+ features ahead of schedule"
    }
  }
}

User: "Update the first point in my Apple work experience to be more specific"
Assistant:
{
  "action": {
    "type": "update_point",
    "data": {
      "sectionId": "section-1",
      "fieldId": "field-1-0",
      "pointId": "point-1-0-0",
      "content": "Developed iOS applications using Swift and UIKit, improving user engagement by 30% and reducing crash rate by 50%"
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
        "Responsibility: Worked on user interface improvements and performance optimization",
        "Responsibility: Collaborated with senior engineers on feature development"
      ]
    }
  }
}
`;
