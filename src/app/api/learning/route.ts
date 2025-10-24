// src/app/api/learning/route.ts
// 🧠 学习分析API - 提供学习洞察和优化建议

import { NextResponse } from "next/server";
import { LearningSystem } from "../../agents/learningSystem";

const learningSystem = new LearningSystem();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing userId parameter" 
      }, { status: 400 });
    }

    switch (action) {
      case 'analyze':
        // 分析用户模式
        const userProfile = await learningSystem.analyzeUserPatterns(userId);
        return NextResponse.json({
          success: true,
          data: {
            userProfile,
            personalizedRules: learningSystem.generatePersonalizedRules(userId),
            optimizationSuggestions: learningSystem.generateOptimizationSuggestions()
          }
        });

      case 'optimize-prompt':
        const basePrompt = searchParams.get('basePrompt') || '';
        const optimizedPrompt = learningSystem.optimizePrompt(userId, basePrompt);
        return NextResponse.json({
          success: true,
          data: { optimizedPrompt }
        });

      case 'suggestions':
        const suggestions = learningSystem.generateOptimizationSuggestions();
        return NextResponse.json({
          success: true,
          data: { suggestions }
        });

      case 'stats':
        const feedbackData = learningSystem.getFeedbackData();
        const userFeedback = feedbackData.filter(f => f.userId === userId);
        const avgAccuracy = userFeedback.length > 0 
          ? userFeedback.reduce((sum, f) => sum + f.accuracy, 0) / userFeedback.length 
          : 0;
        
        return NextResponse.json({
          success: true,
          data: {
            totalFeedback: feedbackData.length,
            userFeedback: userFeedback.length,
            averageAccuracy: avgAccuracy,
            recentAccuracy: userFeedback.slice(-5).map(f => f.accuracy)
          }
        });

      default:
        return NextResponse.json({
          success: true,
          data: {
            availableActions: ['analyze', 'optimize-prompt', 'suggestions', 'stats'],
            description: 'Learning analysis API endpoints'
          }
        });
    }
  } catch (error) {
    console.error("❌ 学习分析失败:", error);
    return NextResponse.json({
      success: false,
      error: "Learning analysis failed",
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
      case 'apply-rules':
        // 应用个性化规则
        const personalizedRules = learningSystem.generatePersonalizedRules(userId);
        return NextResponse.json({
          success: true,
          data: { appliedRules: personalizedRules.length }
        });

      case 'update-preferences':
        // 更新用户偏好
        const { preferences } = data;
        // TODO: 实现偏好更新逻辑
        return NextResponse.json({
          success: true,
          data: { message: "Preferences updated successfully" }
        });

      default:
        return NextResponse.json({
          success: false,
          error: `Unknown action: ${action}`
        }, { status: 400 });
    }
  } catch (error) {
    console.error("❌ 学习操作失败:", error);
    return NextResponse.json({
      success: false,
      error: "Learning operation failed",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
