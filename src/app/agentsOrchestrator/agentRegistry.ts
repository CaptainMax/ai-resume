// src/app/agentsOrchestrator/agentRegistry.ts
// 📋 Agent注册表 - 注册所有可用的Agent

export interface AgentCapability {
  name: string;
  description: string;
  inputTypes: string[];
  outputTypes: string[];
  parameters: Record<string, any>;
  estimatedTime: number;
  complexity: 'low' | 'medium' | 'high';
}

export interface AgentInfo {
  id: string;
  name: string;
  version: string;
  status: 'active' | 'inactive' | 'maintenance';
  capabilities: AgentCapability[];
  dependencies: string[];
  health: {
    isHealthy: boolean;
    lastCheck: Date;
    errorCount: number;
    successRate: number;
  };
  metadata: {
    author: string;
    description: string;
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface AgentExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTime: number;
  metadata: {
    agentId: string;
    timestamp: Date;
    parameters: Record<string, any>;
  };
}

export class AgentRegistry {
  private agents: Map<string, AgentInfo> = new Map();
  private agentInstances: Map<string, any> = new Map();

  constructor() {
    this.initializeDefaultAgents().catch(console.error);
  }

  /**
   * 注册Agent
   * @param agentInfo Agent信息
   * @param agentInstance Agent实例
   */
  registerAgent(agentInfo: AgentInfo, agentInstance: any): void {
    console.log('📝 注册Agent:', agentInfo.name);
    
    this.agents.set(agentInfo.id, agentInfo);
    this.agentInstances.set(agentInfo.id, agentInstance);
  }

  /**
   * 获取Agent信息
   * @param agentId Agent ID
   * @returns Agent信息
   */
  getAgent(agentId: string): AgentInfo | null {
    return this.agents.get(agentId) || null;
  }

  /**
   * 获取Agent实例
   * @param agentId Agent ID
   * @returns Agent实例
   */
  getAgentInstance(agentId: string): any {
    return this.agentInstances.get(agentId);
  }

  /**
   * 获取所有活跃的Agent
   * @returns 活跃Agent列表
   */
  getActiveAgents(): AgentInfo[] {
    return Array.from(this.agents.values()).filter(agent => agent.status === 'active');
  }

  /**
   * 根据能力查找Agent
   * @param capability 所需能力
   * @returns 匹配的Agent列表
   */
  findAgentsByCapability(capability: string): AgentInfo[] {
    return Array.from(this.agents.values()).filter(agent => 
      agent.capabilities.some(cap => cap.name === capability) && 
      agent.status === 'active'
    );
  }

  /**
   * 执行Agent
   * @param agentId Agent ID
   * @param parameters 执行参数
   * @returns 执行结果
   */
  async executeAgent(agentId: string, parameters: Record<string, any>): Promise<AgentExecutionResult> {
    const startTime = Date.now();
    console.log('🚀 执行Agent:', { agentId, parameters });
    
    const agent = this.agents.get(agentId);
    const agentInstance = this.agentInstances.get(agentId);
    
    if (!agent || !agentInstance) {
      return {
        success: false,
        error: `Agent ${agentId} not found`,
        executionTime: Date.now() - startTime,
        metadata: {
          agentId,
          timestamp: new Date(),
          parameters
        }
      };
    }
    
    if (agent.status !== 'active') {
      return {
        success: false,
        error: `Agent ${agentId} is not active (status: ${agent.status})`,
        executionTime: Date.now() - startTime,
        metadata: {
          agentId,
          timestamp: new Date(),
          parameters
        }
      };
    }
    
    try {
      // 执行Agent
      const result = await agentInstance.execute(parameters);
      
      // 更新健康状态
      this.updateAgentHealth(agentId, true);
      
      return {
        success: true,
        data: result,
        executionTime: Date.now() - startTime,
        metadata: {
          agentId,
          timestamp: new Date(),
          parameters
        }
      };
    } catch (error) {
      console.error('❌ Agent执行失败:', { agentId, error });
      
      // 更新健康状态
      this.updateAgentHealth(agentId, false);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        executionTime: Date.now() - startTime,
        metadata: {
          agentId,
          timestamp: new Date(),
          parameters
        }
      };
    }
  }

  /**
   * 检查Agent健康状态
   * @param agentId Agent ID
   * @returns 健康状态
   */
  async checkAgentHealth(agentId: string): Promise<boolean> {
    const agent = this.agents.get(agentId);
    if (!agent) return false;
    
    try {
      // 执行健康检查
      const agentInstance = this.agentInstances.get(agentId);
      if (agentInstance && typeof agentInstance.healthCheck === 'function') {
        const isHealthy = await agentInstance.healthCheck();
        this.updateAgentHealth(agentId, isHealthy);
        return isHealthy;
      }
      
      return agent.health.isHealthy;
    } catch (error) {
      console.error('❌ Agent健康检查失败:', { agentId, error });
      this.updateAgentHealth(agentId, false);
      return false;
    }
  }

  /**
   * 获取Agent统计信息
   * @returns 统计信息
   */
  getAgentStats(): any {
    const agents = Array.from(this.agents.values());
    
    return {
      total: agents.length,
      active: agents.filter(a => a.status === 'active').length,
      inactive: agents.filter(a => a.status === 'inactive').length,
      maintenance: agents.filter(a => a.status === 'maintenance').length,
      healthy: agents.filter(a => a.health.isHealthy).length,
      unhealthy: agents.filter(a => !a.health.isHealthy).length,
      averageSuccessRate: this.calculateAverageSuccessRate(agents)
    };
  }

  /**
   * 初始化默认Agent
   */
  private async initializeDefaultAgents(): Promise<void> {
    console.log('🔧 初始化默认Agent');
    
    // 注册简历解析Agent
    this.registerAgent({
      id: 'parseResumeAgent',
      name: 'Resume Parser',
      version: '1.0.0',
      status: 'active',
      capabilities: [
        {
          name: 'parse',
          description: '解析简历文件为结构化数据',
          inputTypes: ['text', 'pdf', 'docx'],
          outputTypes: ['json'],
          parameters: { format: 'json' },
          estimatedTime: 3,
          complexity: 'medium'
        },
        {
          name: 'validate',
          description: '验证简历格式和内容',
          inputTypes: ['json'],
          outputTypes: ['boolean'],
          parameters: {},
          estimatedTime: 1,
          complexity: 'low'
        }
      ],
      dependencies: [],
      health: {
        isHealthy: true,
        lastCheck: new Date(),
        errorCount: 0,
        successRate: 1.0
      },
      metadata: {
        author: 'ResumeVision Team',
        description: '智能简历解析Agent',
        tags: ['parsing', 'resume', 'nlp'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }, new (await import('@/app/agents/parseResumeAgent')).ParseResumeAgent());

    // 注册简历分析Agent
    this.registerAgent({
      id: 'analyzeResumeAgent',
      name: 'Resume Analyzer',
      version: '1.0.0',
      status: 'active',
      capabilities: [
        {
          name: 'analyze',
          description: '分析简历内容和结构',
          inputTypes: ['json'],
          outputTypes: ['analysis'],
          parameters: { depth: 'comprehensive' },
          estimatedTime: 5,
          complexity: 'high'
        },
        {
          name: 'score',
          description: '为简历内容评分',
          inputTypes: ['json'],
          outputTypes: ['score'],
          parameters: { criteria: 'standard' },
          estimatedTime: 3,
          complexity: 'medium'
        }
      ],
      dependencies: ['parseResumeAgent'],
      health: {
        isHealthy: true,
        lastCheck: new Date(),
        errorCount: 0,
        successRate: 1.0
      },
      metadata: {
        author: 'ResumeVision Team',
        description: '智能简历分析Agent',
        tags: ['analysis', 'scoring', 'insights'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }, new (await import('@/app/agents/analyzeResumeAgent')).AnalyzeResumeAgent());

    // 注册简历改进Agent
    this.registerAgent({
      id: 'improveResumeAgent',
      name: 'Resume Improver',
      version: '1.0.0',
      status: 'active',
      capabilities: [
        {
          name: 'improve',
          description: '改进和优化简历内容',
          inputTypes: ['json'],
          outputTypes: ['json'],
          parameters: { style: 'professional' },
          estimatedTime: 4,
          complexity: 'high'
        },
        {
          name: 'rewrite',
          description: '重写简历内容',
          inputTypes: ['text'],
          outputTypes: ['text'],
          parameters: { tone: 'professional' },
          estimatedTime: 3,
          complexity: 'medium'
        }
      ],
      dependencies: ['analyzeResumeAgent'],
      health: {
        isHealthy: true,
        lastCheck: new Date(),
        errorCount: 0,
        successRate: 1.0
      },
      metadata: {
        author: 'ResumeVision Team',
        description: '智能简历改进Agent',
        tags: ['improvement', 'rewriting', 'optimization'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }, new (await import('@/app/agents/improveResumeAgent')).ImproveResumeAgent());

    // 注册简历总结Agent
    this.registerAgent({
      id: 'summarizeResumeAgent',
      name: 'Resume Summarizer',
      version: '1.0.0',
      status: 'active',
      capabilities: [
        {
          name: 'summarize',
          description: '生成简历摘要',
          inputTypes: ['json'],
          outputTypes: ['text'],
          parameters: { length: 'brief' },
          estimatedTime: 2,
          complexity: 'low'
        }
      ],
      dependencies: ['parseResumeAgent'],
      health: {
        isHealthy: true,
        lastCheck: new Date(),
        errorCount: 0,
        successRate: 1.0
      },
      metadata: {
        author: 'ResumeVision Team',
        description: '智能简历总结Agent',
        tags: ['summarization', 'extraction'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }, new (await import('@/app/agents/summarizeResumeAgent')).SummarizeResumeAgent());

    // 注册简历修改Agent
    this.registerAgent({
      id: 'resumeModifierAgent',
      name: 'Resume Modifier',
      version: '1.0.0',
      status: 'active',
      capabilities: [
        {
          name: 'modify',
          description: '修改简历内容和结构',
          inputTypes: ['json'],
          outputTypes: ['json'],
          parameters: { action: 'add|edit|remove' },
          estimatedTime: 2,
          complexity: 'medium'
        }
      ],
      dependencies: [],
      health: {
        isHealthy: true,
        lastCheck: new Date(),
        errorCount: 0,
        successRate: 1.0
      },
      metadata: {
        author: 'ResumeVision Team',
        description: '智能简历修改Agent',
        tags: ['modification', 'editing', 'updating'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }, new (await import('@/app/agents/resumeModifierAgent')).ResumeModifierAgent());
  }

  /**
   * 更新Agent健康状态
   */
  private updateAgentHealth(agentId: string, isHealthy: boolean): void {
    const agent = this.agents.get(agentId);
    if (!agent) return;
    
    agent.health.isHealthy = isHealthy;
    agent.health.lastCheck = new Date();
    
    if (!isHealthy) {
      agent.health.errorCount++;
    }
    
    // 计算成功率
    const totalOperations = agent.health.errorCount + (agent.health.successRate * 100);
    agent.health.successRate = totalOperations > 0 ? 
      (totalOperations - agent.health.errorCount) / totalOperations : 1.0;
  }

  /**
   * 计算平均成功率
   */
  private calculateAverageSuccessRate(agents: AgentInfo[]): number {
    if (agents.length === 0) return 0;
    
    const totalSuccessRate = agents.reduce((sum, agent) => sum + agent.health.successRate, 0);
    return totalSuccessRate / agents.length;
  }
}
