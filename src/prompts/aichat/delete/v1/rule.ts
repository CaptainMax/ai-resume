export const DELETE_RULE = `
SPECIAL DELETE CONFIRMATION HANDLING:
- When user says "我确认删除这段", "确认删除", "confirm delete", "yes delete", "delete confirmed" or similar confirmation phrases, IMMEDIATELY execute the delete operation
- Do NOT ask for further confirmation - the user has already confirmed
- Use the selected content from context to identify what to delete
- Return JSON action to delete the selected content immediately
- Delete confirmation: When user says "我确认删除这段" and context shows selected content, immediately return {"action": {"type": "remove_point", "data": {"sectionId": "section_id", "fieldId": "field_id", "pointId": "point_id"}}}
`;
