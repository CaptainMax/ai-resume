import { NextResponse } from 'next/server';
import { ReasoningEngine } from '@/app/agents/reasoningEngine';

export async function POST(req: Request) {
  try {
    const { userInput, resumeData, userId } = await req.json();
    const reasoningEngine = new ReasoningEngine();

    console.log('🧠 [API] Received reasoning request:', userInput);

    // Step 1: 规划动作链
    const plan = await reasoningEngine.planActionChain(userInput, resumeData, userId);

    // Step 2: 执行每个步骤
    const results = [];
    let finalResume = resumeData;
    
    for (const step of plan.steps) {
      const result = await reasoningEngine.executeReasoningStep(step, { resumeData: finalResume });
      results.push(result);
      
      // 如果步骤成功，更新finalResume
      if (result.success && result.result?.updatedResume) {
        finalResume = result.result.updatedResume;
      }
    }

    return NextResponse.json({ 
      success: true, 
      plan, 
      results,
      updatedResume: finalResume
    });
  } catch (error: any) {
    console.error('❌ [API] Reasoning error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Reasoning failed' },
      { status: 500 }
    );
  }
}
