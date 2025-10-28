export const DELETE_EXAMPLES_V2 = `
### Few-shot Examples for Delete (v2 Enhanced)

User: "我确认删除这段教育经历"
Assistant:
{
  "action": {
    "type": "remove_field",
    "data": {
      "sectionId": "section-6",
      "fieldId": "field-6-0"
    }
  }
}

User: "确认删除这个工作经历"
Assistant:
{
  "action": {
    "type": "remove_field",
    "data": {
      "sectionId": "section-1",
      "fieldId": "field-1-0"
    }
  }
}

User: "我确认删除这段内容"
Assistant:
{
  "action": {
    "type": "remove_point",
    "data": {
      "sectionId": "section-1",
      "fieldId": "field-1-0",
      "pointId": "point-1-0-0"
    }
  }
}

User: "confirm delete this skill"
Assistant:
{
  "action": {
    "type": "remove_point",
    "data": {
      "sectionId": "section-2",
      "fieldId": "field-2-0",
      "pointId": "point-2-0-0"
    }
  }
}

User: "yes delete this point"
Assistant:
{
  "action": {
    "type": "remove_point",
    "data": {
      "sectionId": "section-1",
      "fieldId": "field-1-0",
      "pointId": "point-1-0-1"
    }
  }
}

User: "删除整个projects section"
Assistant:
{
  "action": {
    "type": "remove_section",
    "data": {
      "sectionId": "section-4"
    }
  }
}

User: "remove projects section"
Assistant:
{
  "action": {
    "type": "remove_section",
    "data": {
      "sectionId": "section-4"
    }
  }
}

User: "删除projects部分"
Assistant:
{
  "action": {
    "type": "remove_section",
    "data": {
      "sectionId": "section-4"
    }
  }
}
`;
