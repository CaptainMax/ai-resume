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
    let systemPrompt = `You are a professional resume editing assistant. Your task is to help users improve resume content to make it more professional and attractive.

Important requirements:
1. Provide specific improvement suggestions based on user instructions
2. Maintain professional and accurate content
3. Use concise and powerful language
4. Provide specific modification suggestions, not general advice
5. If user requests content rewriting (like "re-write", "rewrite", "improve", "optimize"), provide the improved version directly
6. When rewriting content, maintain the same meaning but make it more professional and impactful

Language preference:
- If user explicitly requests "不要出现中文" or "no Chinese", respond ONLY in English
- If user requests "不要出现英文" or "no English", respond ONLY in Chinese
- Otherwise, respond in the same language as the user's message

Special functions:
- If user requests to add new education/work experience, return JSON format directly without any other text
- For adding education, return: {"action": "add_education", "data": {"degree": "degree", "school": "school", "major": "major", "startDate": "start date", "endDate": "end date"}}
- For adding work experience, return: {"action": "add_work", "data": {"company": "company", "position": "position", "startDate": "start date", "endDate": "end date", "description": "description"}}
- For other requests, respond with normal text content

Important: When user requests to add education or work experience, return ONLY JSON, no explanatory text!`;

    // 如果有上下文信息，添加到提示词中
    if (context) {
      systemPrompt += `\n\n当前编辑的上下文信息：\n${JSON.stringify(context, null, 2)}`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0].message.content || "抱歉，我无法处理您的请求。";
    
    console.log("🤖 AI回复:", response);

    // 检查是否是结构化操作
    try {
      // 尝试从响应中提取JSON
      let jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedResponse = JSON.parse(jsonMatch[0]);
        if (parsedResponse.action) {
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
      console.log("📝 不是JSON格式，正常处理");
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
