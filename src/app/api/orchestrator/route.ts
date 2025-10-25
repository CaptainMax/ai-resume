// src/app/api/orchestrator/route.ts
// 🎯 Agent编排器API端点

import { NextRequest, NextResponse } from 'next/server';
import { AgentOrchestrator } from '@/app/agentsOrchestrator/agentOrchestrator';

const orchestrator = new AgentOrchestrator();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userInput, context, userId, priority = 'medium', timeout = 30000 } = body;

    if (!userInput || !context || !userId) {
      return NextResponse.json({
        success: false,
        error: '缺少必要参数: userInput, context, userId'
      }, { status: 400 });
    }

    console.log("🎯 接收编排请求:", { userInput, userId, priority });

    // 执行编排请求
    const result = await orchestrator.executeRequest({
      userInput,
      context,
      userId,
      priority,
      timeout
    });

    console.log("✅ 编排执行完成:", {
      success: result.success,
      agentsUsed: result.agentsUsed,
      executionTime: result.executionTime
    });

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error("❌ 编排执行失败:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '编排执行失败'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const action = searchParams.get('action') || 'stats';

    switch (action) {
      case 'stats':
        if (!userId) {
          return NextResponse.json({
            success: false,
            error: '缺少userId参数'
          }, { status: 400 });
        }
        
        const stats = orchestrator.getExecutionStats(userId);
        return NextResponse.json({
          success: true,
          data: stats
        });

      case 'status':
        const systemStatus = orchestrator.getSystemStatus();
        return NextResponse.json({
          success: true,
          data: systemStatus
        });

      case 'cleanup':
        orchestrator.cleanupHistory();
        return NextResponse.json({
          success: true,
          message: '历史记录已清理'
        });

      default:
        return NextResponse.json({
          success: false,
          error: '未知操作'
        }, { status: 400 });
    }

  } catch (error) {
    console.error("❌ 获取编排信息失败:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '获取编排信息失败'
    }, { status: 500 });
  }
}
