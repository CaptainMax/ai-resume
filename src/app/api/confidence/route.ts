// src/app/api/confidence/route.ts
// 🎯 置信度进化API - 管理动态置信度调整

import { NextResponse } from "next/server";
import { ConfidenceEvolution } from "../../agents/confidenceEvolution";

const confidenceEvolution = new ConfidenceEvolution();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');

    switch (action) {
      case 'calculate':
        // 计算动态置信度
        const baseConfidence = parseFloat(searchParams.get('baseConfidence') || '0.7');
        const userAccuracy = parseFloat(searchParams.get('userAccuracy') || '0.5');
        const feedbackQuality = parseFloat(searchParams.get('feedbackQuality') || '0.5');
        const patternMatch = parseFloat(searchParams.get('patternMatch') || '0.5');

        if (!userId) {
          return NextResponse.json({
            success: false,
            error: "Missing userId parameter"
          }, { status: 400 });
        }

        const metrics = confidenceEvolution.calculateDynamicConfidence(
          userId,
          baseConfidence,
          userAccuracy,
          feedbackQuality,
          patternMatch
        );

        return NextResponse.json({
          success: true,
          data: { metrics }
        });

      case 'report':
        // 生成置信度报告
        const report = confidenceEvolution.generateConfidenceReport(userId || undefined);
        return NextResponse.json({
          success: true,
          data: { report }
        });

      case 'history':
        // 获取置信度历史
        const history = confidenceEvolution.getConfidenceHistory(userId || undefined);
        return NextResponse.json({
          success: true,
          data: { history }
        });

      case 'pattern-confidence':
        // 获取模式置信度
        const pattern = searchParams.get('pattern');
        if (!pattern) {
          return NextResponse.json({
            success: false,
            error: "Missing pattern parameter"
          }, { status: 400 });
        }

        const patternConfidence = confidenceEvolution.getPatternConfidence(pattern);
        return NextResponse.json({
          success: true,
          data: { patternConfidence }
        });

      default:
        return NextResponse.json({
          success: true,
          data: {
            availableActions: ['calculate', 'report', 'history', 'pattern-confidence'],
            description: 'Confidence evolution API endpoints'
          }
        });
    }
  } catch (error) {
    console.error("❌ 置信度计算失败:", error);
    return NextResponse.json({
      success: false,
      error: "Confidence calculation failed",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId, action, data } = await req.json();

    if (!userId || !action) {
      return NextResponse.json({
        success: false,
        error: "Missing required parameters: userId, action"
      }, { status: 400 });
    }

    switch (action) {
      case 'learn-pattern':
        // 学习模式置信度
        const { pattern, success } = data;
        if (!pattern || typeof success !== 'boolean') {
          return NextResponse.json({
            success: false,
            error: "Missing pattern or success data"
          }, { status: 400 });
        }

        confidenceEvolution.learnPatternConfidence(pattern, success);
        return NextResponse.json({
          success: true,
          data: { message: "Pattern confidence updated successfully" }
        });

      case 'reset':
        // 重置置信度数据
        confidenceEvolution.resetConfidenceData();
        return NextResponse.json({
          success: true,
          data: { message: "Confidence data reset successfully" }
        });

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${action}`
        }, { status: 400 });
    }
  } catch (error) {
    console.error("❌ 置信度操作失败:", error);
    return NextResponse.json({
      success: false,
      error: "Confidence operation failed",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
