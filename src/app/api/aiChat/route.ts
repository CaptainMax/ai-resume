import { NextResponse } from "next/server";
import { openai } from "../openai-client";


export async function POST(req: Request) {
  try {
    const { message, context } = await req.json();
    
    console.log("🤖 收到AI聊天请求:", message);
    console.log("📝 上下文信息:", context);

    if (!message) {
      return NextResponse.json({ success: false, error: "Missing message" }, { status: 400 });
    }

    let systemPrompt = `You are a helpful resume editing assistant. You can help users edit their resume content naturally, just like ChatGPT.

You have access to the user's resume structure and can perform these actions:
1. Add new education or work experience entries
2. Add content to existing work experience entries  
3. Rewrite or improve existing content
4. Provide general resume advice

When the user wants to add something new or modify existing content, you should:
- Understand their intent naturally (no need for specific keywords)
- Use the context information to find the right place to make changes
- Respond in the same language as the user's request
- If they ask for English content, provide everything in English

SPECIAL REWRITE HANDLING:
- When user says "rewrite", "re-write", "re write", "improve", "optimize", "enhance", "polish", "refine" or similar about selected content, directly rewrite the selected content
- Do NOT ask for clarification - use the selected content from context
- Return the rewritten content directly as text (not JSON) for immediate display
- Make the rewrite more professional, clear, and impactful

SPECIAL DELETE CONFIRMATION HANDLING:
- When user says "我确认删除这段", "确认删除", "confirm delete", "yes delete", "delete confirmed" or similar confirmation phrases, IMMEDIATELY execute the delete operation
- Do NOT ask for further confirmation - the user has already confirmed
- Use the selected content from context to identify what to delete
- Return JSON action to delete the selected content immediately

For ANY request that involves adding, modifying, or changing resume content, ALWAYS return JSON in this format (don't ask for clarification):

SINGLE ACTION:
{
  "action": {
    "type": "add_field|remove_field|update_field|add_point|remove_point|update_point|move_field|move_point",
    "data": {
      "sectionId": "exact_section_id_from_context",
      "fieldId": "exact_field_id_from_context", 
      "pointId": "exact_point_id_from_context",
      "fieldName": "field_name",
      "content": "point_content",
      "points": ["point1", "point2", "point3"]
    }
  }
}

BATCH ACTIONS (for multiple operations):
{
  "actions": [
    {
      "type": "update_point",
      "data": {
        "sectionId": "section_id",
        "fieldId": "field_id",
        "pointId": "point_id",
        "content": "updated_content"
      }
    },
    {
      "type": "update_point", 
      "data": {
        "sectionId": "section_id",
        "fieldId": "field_id",
        "pointId": "point_id2",
        "content": "updated_content2"
      }
    }
  ]
}

EXAMPLES:
- Add education: {"action": {"type": "add_field", "data": {"sectionId": "education_section_id", "fieldName": "The University of Texas at Arlington", "points": ["Location: Arlington, TX", "Date: Sep. 2017 - Dec. 2020", "Degree: B.S. Computer Science"]}}}
- Add work: {"action": {"type": "add_field", "data": {"sectionId": "work_section_id", "fieldName": "Apple", "points": ["Position: Software Engineer", "Date: Mar. 2022 - Feb. 2025", "Description: Developed iOS applications"]}}}
- Add point: {"action": {"type": "add_point", "data": {"sectionId": "section_id", "fieldId": "field_id", "content": "New point content"}}}
- Update point: {"action": {"type": "update_point", "data": {"sectionId": "section_id", "fieldId": "field_id", "pointId": "point_id", "content": "Updated content"}}}
- Remove field: {"action": {"type": "remove_field", "data": {"sectionId": "section_id", "fieldId": "field_id"}}}
- Remove point: {"action": {"type": "remove_point", "data": {"sectionId": "section_id", "fieldId": "field_id", "pointId": "point_id"}}}
- Delete confirmation: When user says "我确认删除这段" and context shows selected content, immediately return {"action": {"type": "remove_point", "data": {"sectionId": "section_id", "fieldId": "field_id", "pointId": "point_id"}}}

BATCH OPERATION EXAMPLES:
- Remove "Responsibility:" prefix from all points: {"actions": [{"type": "update_point", "data": {"sectionId": "work_section_id", "fieldId": "field_id", "pointId": "point_id1", "content": "Revamped the interaction service..."}}, {"type": "update_point", "data": {"sectionId": "work_section_id", "fieldId": "field_id", "pointId": "point_id2", "content": "Proficient in building dynamic..."}}]}
- Update multiple points: {"actions": [{"type": "update_point", "data": {"sectionId": "section_id", "fieldId": "field_id", "pointId": "point_id1", "content": "Updated content 1"}}, {"type": "update_point", "data": {"sectionId": "section_id", "fieldId": "field_id", "pointId": "point_id2", "content": "Updated content 2"}}]}

IMPORTANT EDUCATION RULES:
- For education fields: fieldName should be the FULL SCHOOL NAME (e.g., "The University of Texas at Arlington", "Stanford University")
- For education points: DO NOT repeat the school name in points, only include: Location, Date, Degree, Major, GPA, etc.
- For work fields: fieldName should be the COMPANY NAME (e.g., "Apple", "Google", "Microsoft")
- For work points: DO NOT repeat the company name in points, only include: Position, Date, Description, Responsibilities, etc.

For other requests, just respond normally with helpful text.`;

    // 如果有上下文信息，添加到提示词中
    if (context) {
      systemPrompt += `\n\n当前编辑的上下文信息：\n${JSON.stringify(context, null, 2)}`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // 使用更强的模型
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0.3, // 降低随机性，提高稳定性
      max_tokens: 8000, // 增加token限制
      top_p: 0.9,
    });

    const response = completion.choices[0].message.content || "抱歉，我无法处理您的请求。";
    
    console.log("🤖 AI回复:", response);

    // 检查是否是结构化操作
    try {
      // 尝试多种方式提取JSON
      let jsonMatch = null;
      
      // 方法1: 查找完整的JSON对象
      jsonMatch = response.match(/\{[\s\S]*\}/);
      
      // 方法2: 如果方法1失败，尝试查找以{开头，以}结尾的内容
      if (!jsonMatch) {
        const startIndex = response.indexOf('{');
        const lastIndex = response.lastIndexOf('}');
        if (startIndex !== -1 && lastIndex !== -1 && lastIndex > startIndex) {
          jsonMatch = [response.substring(startIndex, lastIndex + 1)];
        }
      }
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        console.log("🔍 提取的JSON字符串:", jsonStr);
        
        const parsedResponse = JSON.parse(jsonStr);
        if (parsedResponse.action && parsedResponse.data) {
          console.log("🔧 检测到结构化操作:", parsedResponse);
          return NextResponse.json({ 
            success: true, 
            response: response,
            action: parsedResponse.action,
            data: parsedResponse.data
          });
        }
      }
    } catch (e) {
      console.log("📝 JSON解析失败:", e);
      console.log("📝 原始响应:", response);
    }

    return NextResponse.json({ 
      success: true, 
      response: response 
    });

  } catch (err) {
    console.error("❌ AI聊天API错误:", err);
    
    
    return NextResponse.json({ 
      success: false, 
      error: "AI服务暂时不可用，请稍后重试" 
    }, { status: 500 });
  }
}
