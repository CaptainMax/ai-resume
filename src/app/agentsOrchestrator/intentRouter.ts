// src/app/agentsOrchestrator/intentRouter.ts
// 🧭 意图路由器 - 动态路由到对应的Agent

export interface IntentResult {
  intent: string;
  entities: Record<string, any>;
  confidence: number;
  reasoningSteps: string[];
}

export interface AgentResponse {
  success: boolean;
  message: string;
  affectedSection?: string;
  updatedResume?: any;
  error?: string;
}

export class IntentRouter {
  private agentRegistry: Map<string, any> = new Map();
  private isInitialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    // Don't call initializeAgents() here - use lazy initialization
  }

  /**
   * 🎯 动态路由意图到对应的Agent
   */
  async route(intentResult: IntentResult, context: any): Promise<AgentResponse> {
    console.log('🎯 路由意图:', intentResult.intent);
    
    // 🔧 确保Agent已初始化
    await this.ensureInitialized();
    
    const agent = this.agentRegistry.get(intentResult.intent);
    
    if (!agent) {
      return {
        success: false,
        message: `No agent found for intent: ${intentResult.intent}`,
        error: `No agent found for intent: ${intentResult.intent}`
      };
    }

    try {
      const result = await agent.execute(intentResult.entities, context);
      return result;
    } catch (error) {
      console.error('❌ Agent执行失败:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Agent执行失败',
        error: error instanceof Error ? error.message : 'Agent执行失败'
      };
    }
  }

  /**
   * 🔧 确保Agent已初始化（懒加载）
   */
  private async ensureInitialized(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (this.initializationPromise) {
      await this.initializationPromise;
      return;
    }

    this.initializationPromise = this.initializeAgents();
    await this.initializationPromise;
    this.isInitialized = true;
  }

  /**
   * 🔧 初始化Agent注册表
   */
  private async initializeAgents(): Promise<void> {
    // 动态导入所有Agents
    const EducationAgentModule = await import('@/app/agents/educationAgent');
    const WorkExperienceAgentModule = await import('@/app/agents/workExperienceAgent');
    const SkillAgentModule = await import('@/app/agents/skillAgent');
    const DeleteAgentModule = await import('@/app/agents/deleteAgent');
    const EditAgentModule = await import('@/app/agents/editAgent');
    const OptimizeAgentModule = await import('@/app/agents/optimizeAgent');
    const SummaryAgentModule = await import('@/app/agents/summaryAgent');

    // 注册意图到Agent的映射
    this.agentRegistry.set('add_education', new EducationAgentModule.EducationAgent());
    this.agentRegistry.set('add_work_experience', new WorkExperienceAgentModule.WorkExperienceAgent());
    this.agentRegistry.set('add_skill', new SkillAgentModule.SkillAgent());
    this.agentRegistry.set('delete_item', new DeleteAgentModule.DeleteAgent());
    this.agentRegistry.set('edit_item', new EditAgentModule.EditAgent());
    this.agentRegistry.set('optimize_content', new OptimizeAgentModule.OptimizeAgent());
    this.agentRegistry.set('add_summary', new SummaryAgentModule.SummaryAgent());

    console.log('🔧 Agent注册表初始化完成:', Array.from(this.agentRegistry.keys()));
  }

  /**
   * 📊 获取可用的意图列表
   */
  getAvailableIntents(): string[] {
    return Array.from(this.agentRegistry.keys());
  }
}
