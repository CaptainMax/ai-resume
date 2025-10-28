export const DELETE_RULE_V2 = `
SPECIAL DELETE CONFIRMATION HANDLING (v2 Enhanced):
- When user says "我确认删除这段", "确认删除", "confirm delete", "yes delete", "delete confirmed" or similar confirmation phrases, IMMEDIATELY execute the delete operation
- Do NOT ask for further confirmation - the user has already confirmed
- Use the selected content from context to identify what to delete
- Return JSON action to delete the selected content immediately
- Delete confirmation: When user says "我确认删除这段" and context shows selected content, immediately return {"action": {"type": "remove_point", "data": {"sectionId": "section_id", "fieldId": "field_id", "pointId": "point_id"}}}
- Section deletion: When user says "删除整个projects section", "删除projects部分", "remove projects section", "delete projects section", return {"action": {"type": "remove_section", "data": {"sectionId": "section_id"}}}
- Enhanced logging for audit trail and undo functionality
`;
