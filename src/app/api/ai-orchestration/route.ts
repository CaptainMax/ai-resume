import { NextResponse } from 'next/server';
import { AgentOrchestrator } from '@/app/agentsOrchestrator/agentOrchestrator';

const orchestrator = new AgentOrchestrator();

export async function POST(req: Request) {
  try {
    const { userInput, resumeData, userId } = await req.json();
    
    console.log('🎭 [API] Received orchestration request:', userInput);
    
    const result = await orchestrator.executeRequest({
      userInput,
      context: resumeData,
      userId,
    });
    
    console.log('🎭 [API] Orchestration completed:', result);
    
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('❌ [API] Orchestration error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Orchestration failed' },
      { status: 500 }
    );
  }
}
