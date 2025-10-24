// src/app/agentsOrchestrator/agentRouter.ts
// 🎯 Agent路由器 - 根据意图路由任务到正确的Agent

export interface RoutingDecision {
  primaryAgent: string;
  fallbackAgents: string[];
  routingReason: string;
  confidence: number;
  estimatedTime: number;
}

export interface RoutingContext {
  userIntent: any;
  taskClassification: any;
  availableAgents: string[];
  userPreferences: any;
  sessionHistory: any[];
  currentResume: any;
}

export interface AgentSelectionCriteria {
  capability: string;
  priority: 'high' | 'medium' | 'low';
  requirements: Record<string, any>;
  constraints: {
    maxExecutionTime?: number;
    minSuccessRate?: number;
    requiredDependencies?: string[];
  };
}

export class AgentRouter {
  private agentRegistry: any; // TODO: 集成 agentRegistry
  private routingRules: Map<string, AgentSelectionCriteria[]> = new Map();

  constructor(agentRegistry: any) {
    this.agentRegistry = agentRegistry;
    this.initializeRoutingRules();
  }

  /**
   * 路由任务到合适的Agent
   * @param context 路由上下文
   * @returns 路由决策
   */
  async routeTask(context: RoutingContext): Promise<RoutingDecision> {
    console.log('🎯 路由任务:', context);
    
    const { userIntent, taskClassification, availableAgents } = context;
    
    // 根据用户意图确定主要Agent
    const primaryAgent = this.selectPrimaryAgent(userIntent, taskClassification);
    
    // 选择备用Agent
    const fallbackAgents = this.selectFallbackAgents(primaryAgent, context);
    
    // 计算路由置信度
    const confidence = this.calculateRoutingConfidence(primaryAgent, context);
    
    // 估算执行时间
    const estimatedTime = this.estimateExecutionTime(primaryAgent, context);
    
    const decision: RoutingDecision = {
      primaryAgent,
      fallbackAgents,
      routingReason: this.generateRoutingReason(primaryAgent, userIntent),
      confidence,
      estimatedTime
    };
    
    console.log('✅ 路由决策:', decision);
    return decision;
  }

  /**
   * 选择主要Agent
   */
  private selectPrimaryAgent(userIntent: any, taskClassification: any): string {
    const intentType = userIntent.type;
    const complexity = taskClassification.complexity;
    
    // 基于意图类型和复杂度的路由规则
    const routingMap: Record<string, string> = {
      'parse': 'parseResumeAgent',
      'analyze': 'analyzeResumeAgent',
      'improve': 'improveResumeAgent',
      'summarize': 'summarizeResumeAgent',
      'add': 'improveResumeAgent', // 添加内容使用改进Agent
      'edit': 'improveResumeAgent', // 编辑内容使用改进Agent
      'remove': 'improveResumeAgent' // 删除内容使用改进Agent
    };
    
    return routingMap[intentType] || 'parseResumeAgent';
  }

  /**
   * 选择备用Agent
   */
  private selectFallbackAgents(primaryAgent: string, context: RoutingContext): string[] {
    const fallbackMap: Record<string, string[]> = {
      'parseResumeAgent': ['analyzeResumeAgent'], // 解析失败时尝试分析
      'analyzeResumeAgent': ['parseResumeAgent'], // 分析失败时重新解析
      'improveResumeAgent': ['analyzeResumeAgent', 'parseResumeAgent'], // 改进失败时的备用方案
      'summarizeResumeAgent': ['parseResumeAgent'] // 总结失败时重新解析
    };
    
    return fallbackMap[primaryAgent] || [];
  }

  /**
   * 计算路由置信度
   */
  private calculateRoutingConfidence(agentId: string, context: RoutingContext): number {
    let confidence = 0.8; // 基础置信度
    
    // 检查Agent健康状态
    const agent = this.agentRegistry.getAgent(agentId);
    if (agent) {
      confidence *= agent.health.successRate;
      
      // 如果Agent不健康，降低置信度
      if (!agent.health.isHealthy) {
        confidence *= 0.5;
      }
    }
    
    // 检查用户历史成功率
    const userHistory = this.analyzeUserHistory(context);
    if (userHistory.successRate > 0.8) {
      confidence *= 1.1; // 用户历史良好，提高置信度
    } else if (userHistory.successRate < 0.5) {
      confidence *= 0.8; // 用户历史不佳，降低置信度
    }
    
    // 检查任务复杂度匹配
    const taskComplexity = context.taskClassification.complexity;
    const agentCapability = this.getAgentCapability(agentId, taskComplexity);
    confidence *= agentCapability;
    
    return Math.min(confidence, 1.0);
  }

  /**
   * 估算执行时间
   */
  private estimateExecutionTime(agentId: string, context: RoutingContext): number {
    const agent = this.agentRegistry.getAgent(agentId);
    if (!agent) return 5; // 默认5秒
    
    // 基于Agent能力和任务复杂度估算时间
    const baseTime = agent.capabilities.reduce((sum: number, cap: any) => sum + cap.estimatedTime, 0);
    const complexity = context.taskClassification.complexity;
    
    const complexityMultiplier = {
      'simple': 1.0,
      'medium': 1.5,
      'complex': 2.0
    };
    
    return baseTime * (complexityMultiplier[complexity as keyof typeof complexityMultiplier] || 1.0);
  }

  /**
   * 生成路由原因
   */
  private generateRoutingReason(agentId: string, userIntent: any): string {
    const reasons: Record<string, string> = {
      'parseResumeAgent': `选择解析Agent，因为用户意图是"${userIntent.type}"，需要解析简历内容`,
      'analyzeResumeAgent': `选择分析Agent，因为用户意图是"${userIntent.type}"，需要分析简历质量`,
      'improveResumeAgent': `选择改进Agent，因为用户意图是"${userIntent.type}"，需要优化简历内容`,
      'summarizeResumeAgent': `选择总结Agent，因为用户意图是"${userIntent.type}"，需要生成简历摘要`
    };
    
    return reasons[agentId] || `选择${agentId}处理用户请求`;
  }

  /**
   * 初始化路由规则
   */
  private initializeRoutingRules(): void {
    console.log('🔧 初始化路由规则');
    
    // 解析任务的路由规则
    this.routingRules.set('parse', [
      {
        capability: 'parse',
        priority: 'high',
        requirements: { inputFormat: ['text', 'pdf', 'docx'] },
        constraints: {
          maxExecutionTime: 10,
          minSuccessRate: 0.8
        }
      }
    ]);
    
    // 分析任务的路由规则
    this.routingRules.set('analyze', [
      {
        capability: 'analyze',
        priority: 'high',
        requirements: { inputFormat: ['json'] },
        constraints: {
          maxExecutionTime: 15,
          minSuccessRate: 0.7,
          requiredDependencies: ['parseResumeAgent']
        }
      }
    ]);
    
    // 改进任务的路由规则
    this.routingRules.set('improve', [
      {
        capability: 'improve',
        priority: 'high',
        requirements: { inputFormat: ['json'] },
        constraints: {
          maxExecutionTime: 20,
          minSuccessRate: 0.6,
          requiredDependencies: ['analyzeResumeAgent']
        }
      }
    ]);
    
    // 总结任务的路由规则
    this.routingRules.set('summarize', [
      {
        capability: 'summarize',
        priority: 'medium',
        requirements: { inputFormat: ['json'] },
        constraints: {
          maxExecutionTime: 8,
          minSuccessRate: 0.8
        }
      }
    ]);
  }

  /**
   * 分析用户历史
   */
  private analyzeUserHistory(context: RoutingContext): { successRate: number; commonIssues: string[] } {
    // TODO: 实现用户历史分析
    // 分析用户过去的操作成功率和常见问题
    
    return {
      successRate: 0.8, // 临时默认值
      commonIssues: []
    };
  }

  /**
   * 获取Agent能力匹配度
   */
  private getAgentCapability(agentId: string, complexity: string): number {
    const agent = this.agentRegistry.getAgent(agentId);
    if (!agent) return 0.5;
    
    // 基于Agent的复杂度能力计算匹配度
    const complexityScores = {
      'simple': 1.0,
      'medium': 0.8,
      'complex': 0.6
    };
    
    return complexityScores[complexity as keyof typeof complexityScores] || 0.5;
  }

  /**
   * 验证路由决策
   * @param decision 路由决策
   * @param context 路由上下文
   * @returns 验证结果
   */
  async validateRoutingDecision(decision: RoutingDecision, context: RoutingContext): Promise<boolean> {
    console.log('✅ 验证路由决策:', { decision, context });
    
    // 检查主要Agent是否可用
    const primaryAgent = this.agentRegistry.getAgent(decision.primaryAgent);
    if (!primaryAgent || primaryAgent.status !== 'active') {
      console.warn('⚠️ 主要Agent不可用:', decision.primaryAgent);
      return false;
    }
    
    // 检查Agent健康状态
    if (!primaryAgent.health.isHealthy) {
      console.warn('⚠️ 主要Agent不健康:', decision.primaryAgent);
      return false;
    }
    
    // 检查成功率要求
    if (primaryAgent.health.successRate < 0.5) {
      console.warn('⚠️ 主要Agent成功率过低:', primaryAgent.health.successRate);
      return false;
    }
    
    // 检查备用Agent
    for (const fallbackAgentId of decision.fallbackAgents) {
      const fallbackAgent = this.agentRegistry.getAgent(fallbackAgentId);
      if (!fallbackAgent || fallbackAgent.status !== 'active') {
        console.warn('⚠️ 备用Agent不可用:', fallbackAgentId);
        return false;
      }
    }
    
    return true;
  }

  /**
   * 获取路由建议
   * @param context 路由上下文
   * @returns 路由建议
   */
  async getRoutingSuggestions(context: RoutingContext): Promise<any[]> {
    console.log('💡 获取路由建议:', context);
    
    const suggestions = [];
    
    // 基于用户意图提供建议
    if (context.userIntent.type === 'parse') {
      suggestions.push({
        type: 'optimization',
        message: '建议先验证简历格式，确保解析质量',
        priority: 'medium'
      });
    }
    
    if (context.userIntent.type === 'improve') {
      suggestions.push({
        type: 'workflow',
        message: '建议先分析简历，再执行改进操作',
        priority: 'high'
      });
    }
    
    // 基于历史数据提供建议
    const userHistory = this.analyzeUserHistory(context);
    if (userHistory.successRate < 0.7) {
      suggestions.push({
        type: 'warning',
        message: '检测到历史成功率较低，建议使用备用方案',
        priority: 'high'
      });
    }
    
    return suggestions;
  }
}
