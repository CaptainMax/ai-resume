export const BASE_EXAMPLES = `
### Few-shot Examples for Base Operations

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
        "Degree: M.S. Computer Science"
      ]
    }
  }
}

User: "Add a work experience at Google as Software Engineer from 2020 to 2022"
Assistant:
{
  "action": {
    "type": "add_field",
    "data": {
      "sectionId": "section-1",
      "fieldName": "Google",
      "points": [
        "Position: Software Engineer",
        "Date: 2020 - 2022",
        "Description: Developed scalable web applications using React and Node.js"
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
      "content": "Led a team of 5 developers in agile development process"
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
      "content": "Developed iOS applications using Swift and UIKit, improving user engagement by 30%"
    }
  }
}
`;
