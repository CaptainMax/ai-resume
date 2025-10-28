export const EDUCATION_EXAMPLES_V2 = `
### Few-shot Examples for Education (v2 Enhanced)

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
        "Date: Sep. 2019 - Jun. 2021",
        "Degree: M.S. in Computer Science",
        "GPA: 3.8/4.0",
        "Relevant Coursework: Machine Learning, Distributed Systems, Database Design"
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
        "Date: Sep. 2020 - May 2023",
        "Degree: Ph.D. in Computer Science",
        "GPA: 3.9/4.0",
        "Dissertation: Advanced Machine Learning Algorithms for Big Data Processing"
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
        "Date: Aug. 2016 - May 2020",
        "Degree: B.S. in Computer Science",
        "GPA: 3.7/4.0",
        "Relevant Coursework: Data Structures, Algorithms, Software Engineering"
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
        "Date: Aug. 2018 - May 2020",
        "Degree: Master of Business Administration (MBA)",
        "GPA: 3.8/4.0",
        "Concentration: Technology Management"
      ]
    }
  }
}
`;
