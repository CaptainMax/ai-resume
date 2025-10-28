import { NextResponse } from "next/server";
import { openai } from "../openai-client";
import { buildPrompt } from "@/prompts/shared/buildPrompt";
import { extractJsonFromResponse } from "@/prompts/shared/extractJson";


export async function POST(req: Request) {
  try {
    const { message, context } = await req.json();
    
    console.log("🤖 收到AI聊天请求:", message);
    console.log("📝 上下文信息:", context);

    if (!message) {
      return NextResponse.json({ success: false, error: "Missing message" }, { status: 400 });
    }

    // 使用模块化prompt系统构建systemPrompt
    const systemPrompt = await buildPrompt(message, context);

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

    // 使用模块化JSON解析工具检查是否是结构化操作
    const parsedResult = extractJsonFromResponse(response);
    if (parsedResult) {
      return NextResponse.json(parsedResult);
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
