// src/app/api/llm-reasoning/feedback/route.ts
// 📝 LLM 推理引擎反馈收集 API

import { NextRequest, NextResponse } from 'next/server';
import { LLMReasoningEngine } from '@/app/agents/llmReasoningEngine';

const llmReasoningEngine = new LLMReasoningEngine();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, reasoning, userCorrection, satisfaction, accuracy, success } = body;

    if (!userId || !reasoning) {
      return NextResponse.json({
        success: false,
        error: '缺少必要参数'
      }, { status: 400 });
    }

    // 收集反馈
    llmReasoningEngine.collectFeedback(userId, {
      reasoning,
      userCorrection,
      satisfaction,
      accuracy,
      success
    });

    return NextResponse.json({
      success: true,
      message: '反馈已收集',
      data: {
        feedbackId: `feedback_${Date.now()}`,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ 收集反馈失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '收集反馈失败'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default';

    // 获取学习数据
    const learningData = llmReasoningEngine.getLearningData(userId);

    return NextResponse.json({
      success: true,
      data: learningData
    });

  } catch (error) {
    console.error('❌ 获取学习数据失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '获取学习数据失败'
    }, { status: 500 });
  }
}
