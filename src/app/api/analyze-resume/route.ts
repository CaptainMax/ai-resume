// src/app/api/analyze-resume/route.ts
// 📊 简历分析API端点

import { NextRequest, NextResponse } from 'next/server';
import { AnalyzeResumeAgent } from '@/app/agents/analyzeResumeAgent';

export async function POST(request: NextRequest) {
  try {
    console.log("📊 收到简历分析请求");
    
    const body = await request.json();
    const { resumeData, options = {} } = body;

    if (!resumeData) {
      return NextResponse.json({
        success: false,
        error: "缺少简历数据"
      }, { status: 400 });
    }

    // 创建分析Agent实例
    const analyzeAgent = new AnalyzeResumeAgent();
    
    // 执行分析
    const result = await analyzeAgent.analyzeResume(resumeData, options);
    
    console.log("✅ 简历分析完成:", { 
      success: result.success, 
      score: result.analysis?.score,
      time: result.metadata?.analysisTime 
    });

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error("❌ 简历分析失败:", error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "分析失败"
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'status') {
      return NextResponse.json({
        success: true,
        data: {
          status: 'active',
          version: '1.0.0',
          capabilities: ['analyze', 'score', 'suggest']
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      data: {
        message: "简历分析API",
        endpoints: {
          POST: "分析简历",
          GET: "获取状态"
        }
      }
    });
    
  } catch (error) {
    console.error("❌ 获取状态失败:", error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "获取状态失败"
    }, { status: 500 });
  }
}
