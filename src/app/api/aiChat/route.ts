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

    // 构建系统提示词，包含上下文信息
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

For actions that modify the resume, return JSON in this flexible format:
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

EXAMPLES:
- Add education: {"action": {"type": "add_field", "data": {"sectionId": "education_section_id", "fieldName": "Master's - Trine University", "points": ["School: Trine University", "Major: MISI", "Duration: Fall 2023 - Fall 2025"]}}}
- Add work: {"action": {"type": "add_field", "data": {"sectionId": "work_section_id", "fieldName": "Software Engineer - Apple", "points": ["Company: Apple", "Position: Software Engineer", "Duration: 2022-2025", "Description: ..."]}}}
- Add point: {"action": {"type": "add_point", "data": {"sectionId": "section_id", "fieldId": "field_id", "content": "New point content"}}}
- Update point: {"action": {"type": "update_point", "data": {"sectionId": "section_id", "fieldId": "field_id", "pointId": "point_id", "content": "Updated content"}}}
- Remove field: {"action": {"type": "remove_field", "data": {"sectionId": "section_id", "fieldId": "field_id"}}}

IMPORTANT: 
- Use exact IDs from context
- Be creative with field names and point content
- Support any type of resume modification
- No hardcoded field structures - let AI decide the best format

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
      max_tokens: 2000, // 增加token限制
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
