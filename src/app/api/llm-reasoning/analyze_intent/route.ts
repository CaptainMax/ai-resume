// src/app/api/llm-reasoning/analyze_intent/route.ts
// 🧠 LLM意图分析API - 真正的推理驱动意图分析

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userInput } = body;

    if (!userInput) {
      return NextResponse.json({
        success: false,
        error: '用户输入不能为空'
      }, { status: 400 });
    }

    console.log("🧠 开始LLM意图分析:", userInput);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `你是一个智能简历助手的意图分析专家。你的任务是分析用户的自然语言输入，识别用户的真实意图。

可能的意图类型：
- add_education: 添加教育经历
- add_work_experience: 添加工作经验  
- add_skill: 添加技能
- delete_item: 删除项目
- edit_item: 编辑项目
- optimize_content: 优化内容
- general_chat: 一般聊天

返回JSON格式：
{
  "intent": "意图类型",
  "entities": {
    "相关实体字段": "值"
  },
  "confidence": 0.0-1.0,
  "reasoning": "推理过程"
}

注意：
- 不要基于关键词匹配，要理解用户的真实意图
- 即使没有明确提到"添加"，如果用户描述教育或工作经历，也应该识别为add_education或add_work_experience
- 置信度要基于理解的准确性，不是关键词匹配的数量`
        },
        {
          role: "user",
          content: userInput
        }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('AI没有返回有效响应');
    }

    const analysis = JSON.parse(response);
    console.log("✅ LLM意图分析完成:", analysis);

    return NextResponse.json({
      success: true,
      intent: analysis.intent,
      entities: analysis.entities || {},
      confidence: analysis.confidence || 0.5,
      reasoning: analysis.reasoning || '',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ LLM意图分析失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'LLM意图分析失败'
    }, { status: 500 });
  }
}
