export const EDUCATION_EXAMPLES = `
### Few-shot Examples for Education

User: "Add a new education entry: Stanford University, 2019-2021, M.S. in Computer Science"
Assistant:
{
  "action": {
    "type": "add_field",
    "data": {
      "sectionId": "section-6",
      "fieldName": "Stanford University",
      "points": [
        "Location: Stanford, CA",
        "Date: 2019 - 2021",
        "Degree: M.S. in Computer Science"
      ]
    }
  }
}

User: "I got my PhD from MIT in 2023"
Assistant:
{
  "action": {
    "type": "add_field",
    "data": {
      "sectionId": "section-6",
      "fieldName": "Massachusetts Institute of Technology",
      "points": [
        "Location: Cambridge, MA",
        "Date: 2020 - 2023",
        "Degree: Ph.D. in Computer Science"
      ]
    }
  }
}

User: "Add my bachelor's degree from UC Berkeley, 2016-2020, Computer Science"
Assistant:
{
  "action": {
    "type": "add_field",
    "data": {
      "sectionId": "section-6",
      "fieldName": "University of California, Berkeley",
      "points": [
        "Location: Berkeley, CA",
        "Date: 2016 - 2020",
        "Degree: B.S. in Computer Science",
        "GPA: 3.8/4.0"
      ]
    }
  }
}

User: "Add education: Harvard Business School, MBA, 2018-2020"
Assistant:
{
  "action": {
    "type": "add_field",
    "data": {
      "sectionId": "section-6",
      "fieldName": "Harvard Business School",
      "points": [
        "Location: Boston, MA",
        "Date: 2018 - 2020",
        "Degree: MBA"
      ]
    }
  }
}
`;
