import { NextResponse } from "next/server";
import { LearningSystem } from "../../agents/learningSystem";

// 全局学习系统实例
const learningSystem = new LearningSystem();

export async function POST(req: Request) {
  try {
    const { userId, originalText, aiParse, userCorrections } = await req.json();
    
    console.log("📚 收到用户反馈:", userId);
    console.log("📝 修正操作数量:", 
      userCorrections.sectionMoves.length + 
      userCorrections.fieldRenames.length + 
      userCorrections.contentEdits.length
    );
    
    // 收集用户反馈
    await learningSystem.collectFeedback(
      userId,
      originalText,
      aiParse,
      userCorrections
    );
    
    // 获取学习洞察
    const insights = learningSystem.getLearningInsights();
    
    return NextResponse.json({
      success: true,
      message: "反馈收集成功",
      insights: insights ? {
        commonMistakes: insights.commonMistakes.length,
        userPreferences: insights.userPreferences.length,
        parsingPatterns: insights.parsingPatterns.length
      } : null
    });
    
  } catch (error) {
    console.error("❌ 反馈收集失败:", error);
    return NextResponse.json({
      success: false,
      error: "反馈收集失败"
    }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    // 获取学习洞察
    const insights = learningSystem.getLearningInsights();
    const feedbackData = learningSystem.getFeedbackData();
    
    return NextResponse.json({
      success: true,
      insights,
      feedbackCount: feedbackData.length,
      lastFeedback: feedbackData.length > 0 ? feedbackData[feedbackData.length - 1].timestamp : null
    });
    
  } catch (error) {
    console.error("❌ 获取学习数据失败:", error);
    return NextResponse.json({
      success: false,
      error: "获取学习数据失败"
    }, { status: 500 });
  }
}
