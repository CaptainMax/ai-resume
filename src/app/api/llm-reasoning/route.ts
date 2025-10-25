// src/app/api/llm-reasoning/route.ts
// 🧠 LLM 推理引擎 API 端点

import { NextRequest, NextResponse } from 'next/server';
import { LLMReasoningEngine } from '@/app/agents/llmReasoningEngine';
import { ActionExecutor } from '@/app/agents/actionExecutor';

const llmReasoningEngine = new LLMReasoningEngine();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userInput, currentResume, userId = 'default' } = body;

    if (!userInput) {
      return NextResponse.json({
        success: false,
        error: '用户输入不能为空'
      }, { status: 400 });
    }

    console.log("🧠 开始LLM推理:", userInput);

    // 1. 使用 LLM 分析用户意图
    const reasoning = await llmReasoningEngine.analyzeUserIntent(
      userInput,
      currentResume,
      userId
    );

    console.log("✅ LLM推理完成:", reasoning);

    return NextResponse.json({
      success: true,
      data: {
        reasoning,
        source: 'LLM-Function-Calling',
        confidence: reasoning.confidence,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ LLM推理失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'LLM推理失败'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default';

    // 获取用户历史和学习数据
    const history = llmReasoningEngine.getUserHistory(userId);
    const learningData = llmReasoningEngine.getLearningData(userId);

    return NextResponse.json({
      success: true,
      data: {
        history,
        learningData,
        engine: 'LLM-Function-Calling-with-Learning',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ 获取历史失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '获取历史失败'
    }, { status: 500 });
  }
}
