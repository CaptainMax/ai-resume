// src/app/api/orchestrator/route.ts
// 🧭 主编排器API - 统一处理所有意图

import { NextRequest, NextResponse } from 'next/server';
import { LLMReasoningEngine } from '@/app/agents/llmReasoningEngine';
import { IntentRouter } from '@/app/agentsOrchestrator/intentRouter';

const llmReasoningEngine = new LLMReasoningEngine();
const intentRouter = new IntentRouter();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { intent, entities, context, userId = 'default' } = body;

    if (!intent || !entities) {
      return NextResponse.json({
        success: false,
        error: '缺少意图或实体信息'
      }, { status: 400 });
    }

    console.log("🧭 开始编排处理:", { intent, entities });

    // 1️⃣ 直接使用传入的意图和实体
    const reasoningResult = {
      success: true,
      intent,
      entities,
      confidence: 1.0, // 已经通过前端验证
      reasoningSteps: ['意图已通过前端LLM分析验证']
    };

    console.log("🧠 使用已验证的意图:", reasoningResult);

    // 2️⃣ 动态路由到对应Agent
    const agentResult = await intentRouter.route(reasoningResult, context);
    
    console.log("🎯 Agent执行完成:", agentResult);

    // 3️⃣ 收集反馈数据
    const feedbackData = {
      userId,
      reasoning: {
        intent: reasoningResult.intent,
        entities: reasoningResult.entities,
        confidence: reasoningResult.confidence,
        reasoningSteps: reasoningResult.reasoningSteps
      },
      success: agentResult.success,
      timestamp: new Date().toISOString()
    };

    // 收集反馈（同步）
    try {
      llmReasoningEngine.collectFeedback(userId, {
        reasoning: {
          intent: reasoningResult.intent,
          entities: reasoningResult.entities,
          action: 'add' as const,
          target: 'field' as const,
          entity: reasoningResult.intent,
          data: reasoningResult.entities,
          confidence: reasoningResult.confidence,
          reasoning: reasoningResult.reasoningSteps.join('; '),
          reasoningSteps: reasoningResult.reasoningSteps
        },
        success: agentResult.success
      });
    } catch (error) {
      console.error('反馈收集失败:', error);
    }

    return NextResponse.json({
      success: agentResult.success,
      message: agentResult.message || 'Agent execution completed',
      updatedResume: agentResult.updatedResume || null,
      data: {
        intent: reasoningResult.intent,
        entities: reasoningResult.entities,
        confidence: reasoningResult.confidence,
        reasoningSteps: reasoningResult.reasoningSteps,
        feedbackId: feedbackData.timestamp
      },
      source: 'Reasoning-Driven-Agent-System',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ 编排处理失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '编排处理失败'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const availableIntents = intentRouter.getAvailableIntents();
    
    return NextResponse.json({
      success: true,
      data: {
        availableIntents,
        system: 'Reasoning-Driven-Agent-System',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ 获取系统状态失败:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '获取系统状态失败'
    }, { status: 500 });
  }
}