// src/app/api/llm-reasoning/reflect/route.ts
// 🎯 LLM反思API - 自我反思和纠错机制

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userInput, output, timestamp } = body;

    if (!userInput || !output) {
      return NextResponse.json({
        success: false,
        error: '缺少必要参数'
      }, { status: 400 });
    }

    console.log("🎯 开始LLM反思:", { userInput, confidence: output.confidence });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `你是一个AI系统的反思专家。当系统对用户输入的置信度较低时，你需要分析原因并提供改进建议。

你的任务是：
1. 分析为什么置信度低
2. 识别可能的误解或遗漏
3. 提供具体的改进建议
4. 生成学习要点

返回JSON格式：
{
  "analysis": "分析低置信度的原因",
  "suggestions": ["改进建议1", "改进建议2"],
  "learning_points": ["学习要点1", "学习要点2"],
  "confidence_improvement": "如何提高未来类似情况的置信度"
}`
        },
        {
          role: "user",
          content: `用户输入: "${userInput}"
系统输出: ${JSON.stringify(output, null, 2)}
时间戳: ${timestamp}

请分析为什么系统对这个输入的置信度较低，并提供改进建议。`
        }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('AI没有返回有效响应');
    }

    const reflection = JSON.parse(response);
    console.log("✅ LLM反思完成:", reflection);

    return NextResponse.json({
      success: true,
      reflection,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ LLM反思失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'LLM反思失败'
    }, { status: 500 });
  }
}
