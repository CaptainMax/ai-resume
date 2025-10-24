// src/app/agentsOrchestrator/agentOrchestrator.ts
// 🎭 Agent编排器 - 管理多Agent执行流程

export interface ExecutionContext {
  sessionId: string;
  userId: string;
  userIntent: any;
  taskClassification: any;
  routingDecision: any;
  executionPlan: any;
  currentStep: number;
  results: Map<string, any>;
  errors: Map<string, string>;
  startTime: Date;
  metadata: Record<string, any>;
}

export interface ExecutionStatus {
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  currentStep: string;
  progress: number; // 0-100
  estimatedTimeRemaining: number;
  error?: string;
  results?: any;
}

export interface OrchestrationResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTime: number;
  stepsExecuted: string[];
  agentResults: Map<string, any>;
  metadata: {
    sessionId: string;
    userId: string;
    timestamp: Date;
    totalSteps: number;
    successfulSteps: number;
    failedSteps: number;
  };
}

export class AgentOrchestrator {
  private agentRegistry: any; // TODO: 集成 agentRegistry
  private agentRouter: any; // TODO: 集成 agentRouter
  private contextMemory: any; // TODO: 集成 contextMemory
  private activeExecutions: Map<string, ExecutionContext> = new Map();
  private executionHistory: Map<string, OrchestrationResult> = new Map();

  constructor(agentRegistry: any, agentRouter: any, contextMemory: any) {
    this.agentRegistry = agentRegistry;
    this.agentRouter = agentRouter;
    this.contextMemory = contextMemory;
  }

  /**
   * 编排执行任务
   * @param sessionId 会话ID
   * @param userId 用户ID
   * @param userIntent 用户意图
   * @param taskClassification 任务分类
   * @param executionPlan 执行计划
   * @returns 编排结果
   */
  async orchestrateExecution(
    sessionId: string,
    userId: string,
    userIntent: any,
    taskClassification: any,
    executionPlan: any
  ): Promise<OrchestrationResult> {
    console.log('🎭 开始编排执行:', { sessionId, userId, userIntent, taskClassification });
    
    const startTime = new Date();
    
    // 创建执行上下文
    const context: ExecutionContext = {
      sessionId,
      userId,
      userIntent,
      taskClassification,
      routingDecision: null,
      executionPlan,
      currentStep: 0,
      results: new Map(),
      errors: new Map(),
      startTime,
      metadata: {}
    };
    
    // 注册活跃执行
    this.activeExecutions.set(sessionId, context);
    
    try {
      // 执行路由决策
      const routingDecision = await this.agentRouter.routeTask({
        userIntent,
        taskClassification,
        availableAgents: this.agentRegistry.getActiveAgents().map((a: any) => a.id),
        userPreferences: await this.contextMemory.getUserPreferences(userId),
        sessionHistory: this.contextMemory.getConversationHistory(),
        currentResume: null // TODO: 获取当前简历
      });
      
      context.routingDecision = routingDecision;
      
      // 验证路由决策
      const isValid = await this.agentRouter.validateRoutingDecision(routingDecision, {
        userIntent,
        taskClassification,
        availableAgents: this.agentRegistry.getActiveAgents().map((a: any) => a.id),
        userPreferences: await this.contextMemory.getUserPreferences(userId),
        sessionHistory: this.contextMemory.getConversationHistory(),
        currentResume: null
      });
      
      if (!isValid) {
        throw new Error('路由决策验证失败');
      }
      
      // 执行计划步骤
      const result = await this.executePlan(context);
      
      // 记录执行历史
      this.executionHistory.set(sessionId, result);
      
      return result;
    } catch (error) {
      console.error('❌ 编排执行失败:', error);
      
      const errorResult: OrchestrationResult = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        executionTime: Date.now() - startTime.getTime(),
        stepsExecuted: [],
        agentResults: new Map(),
        metadata: {
          sessionId,
          userId,
          timestamp: new Date(),
          totalSteps: executionPlan.steps.length,
          successfulSteps: 0,
          failedSteps: executionPlan.steps.length
        }
      };
      
      this.executionHistory.set(sessionId, errorResult);
      return errorResult;
    } finally {
      // 清理活跃执行
      this.activeExecutions.delete(sessionId);
    }
  }

  /**
   * 执行计划步骤
   */
  private async executePlan(context: ExecutionContext): Promise<OrchestrationResult> {
    const { executionPlan, routingDecision } = context;
    const agentResults = new Map();
    const stepsExecuted: string[] = [];
    let successfulSteps = 0;
    let failedSteps = 0;
    
    console.log('📋 执行计划步骤:', executionPlan.steps);
    
    // 按顺序执行步骤
    for (let i = 0; i < executionPlan.steps.length; i++) {
      const step = executionPlan.steps[i];
      context.currentStep = i;
      
      try {
        console.log(`🔄 执行步骤 ${i + 1}/${executionPlan.steps.length}:`, step.name);
        
        // 检查依赖
        if (!this.checkDependencies(step, agentResults)) {
          throw new Error(`步骤 ${step.name} 的依赖未满足`);
        }
        
        // 执行Agent
        const agentResult = await this.executeAgent(step, context);
        
        if (agentResult.success) {
          agentResults.set(step.id, agentResult.data);
          stepsExecuted.push(step.id);
          successfulSteps++;
          console.log(`✅ 步骤 ${step.name} 执行成功`);
        } else {
          throw new Error(agentResult.error || `步骤 ${step.name} 执行失败`);
        }
        
      } catch (error) {
        console.error(`❌ 步骤 ${step.name} 执行失败:`, error);
        
        // 记录错误
        context.errors.set(step.id, error instanceof Error ? error.message : String(error));
        failedSteps++;
        
        // 检查是否有重试策略
        if (step.retryPolicy && step.retryPolicy.maxRetries > 0) {
          console.log(`🔄 尝试重试步骤 ${step.name}`);
          
          // TODO: 实现重试逻辑
          // 这里可以添加重试机制
        }
        
        // 检查是否有备用计划
        if (executionPlan.fallbackPlan && failedSteps > 0) {
          console.log('🔄 执行备用计划');
          return await this.executeFallbackPlan(context, executionPlan.fallbackPlan);
        }
        
        // 如果关键步骤失败，停止执行
        if (this.isCriticalStep(step)) {
          throw error;
        }
      }
    }
    
    // 构建最终结果
    const executionTime = Date.now() - context.startTime.getTime();
    const finalResult = this.buildFinalResult(context, agentResults, stepsExecuted, successfulSteps, failedSteps, executionTime);
    
    console.log('🎉 计划执行完成:', finalResult);
    return finalResult;
  }

  /**
   * 执行单个Agent
   */
  private async executeAgent(step: any, context: ExecutionContext): Promise<any> {
    const agentId = step.agent;
    const parameters = {
      ...step.parameters,
      context: {
        sessionId: context.sessionId,
        userId: context.userId,
        userIntent: context.userIntent,
        previousResults: Object.fromEntries(context.results)
      }
    };
    
    console.log(`🤖 执行Agent ${agentId}:`, parameters);
    
    // 执行Agent
    const result = await this.agentRegistry.executeAgent(agentId, parameters);
    
    // 记录结果
    context.results.set(step.id, result);
    
    return result;
  }

  /**
   * 检查步骤依赖
   */
  private checkDependencies(step: any, agentResults: Map<string, any>): boolean {
    if (!step.dependencies || step.dependencies.length === 0) {
      return true;
    }
    
    for (const dependency of step.dependencies) {
      if (!agentResults.has(dependency)) {
        console.warn(`⚠️ 依赖 ${dependency} 未满足`);
        return false;
      }
    }
    
    return true;
  }

  /**
   * 检查是否为关键步骤
   */
  private isCriticalStep(step: any): boolean {
    // TODO: 实现关键步骤判断逻辑
    // 某些步骤失败会导致整个任务失败
    return step.name.includes('validate') || step.name.includes('parse');
  }

  /**
   * 执行备用计划
   */
  private async executeFallbackPlan(context: ExecutionContext, fallbackPlan: any): Promise<OrchestrationResult> {
    console.log('🔄 执行备用计划:', fallbackPlan);
    
    // 更新执行计划
    context.executionPlan = fallbackPlan;
    context.currentStep = 0;
    
    // 重新执行
    return await this.executePlan(context);
  }

  /**
   * 构建最终结果
   */
  private buildFinalResult(
    context: ExecutionContext,
    agentResults: Map<string, any>,
    stepsExecuted: string[],
    successfulSteps: number,
    failedSteps: number,
    executionTime: number
  ): OrchestrationResult {
    const success = failedSteps === 0;
    
    return {
      success,
      data: success ? this.aggregateResults(agentResults) : null,
      error: success ? undefined : `执行失败，${failedSteps} 个步骤失败`,
      executionTime,
      stepsExecuted,
      agentResults,
      metadata: {
        sessionId: context.sessionId,
        userId: context.userId,
        timestamp: new Date(),
        totalSteps: context.executionPlan.steps.length,
        successfulSteps,
        failedSteps
      }
    };
  }

  /**
   * 聚合结果
   */
  private aggregateResults(agentResults: Map<string, any>): any {
    // TODO: 实现结果聚合逻辑
    // 将多个Agent的结果合并为最终结果
    
    const results = Object.fromEntries(agentResults);
    
    // 简单的聚合策略
    if (results.parse_content) {
      return results.parse_content;
    }
    
    if (results.analyze_structure) {
      return results.analyze_structure;
    }
    
    if (results.improve_content) {
      return results.improve_content;
    }
    
    return results;
  }

  /**
   * 获取执行状态
   * @param sessionId 会话ID
   * @returns 执行状态
   */
  getExecutionStatus(sessionId: string): ExecutionStatus | null {
    const context = this.activeExecutions.get(sessionId);
    if (!context) {
      return null;
    }
    
    const totalSteps = context.executionPlan.steps.length;
    const progress = (context.currentStep / totalSteps) * 100;
    const estimatedTimeRemaining = this.estimateRemainingTime(context);
    
    return {
      status: 'running',
      currentStep: context.executionPlan.steps[context.currentStep]?.name || 'unknown',
      progress,
      estimatedTimeRemaining
    };
  }

  /**
   * 估算剩余时间
   */
  private estimateRemainingTime(context: ExecutionContext): number {
    const remainingSteps = context.executionPlan.steps.slice(context.currentStep);
    return remainingSteps.reduce((total, step) => total + step.estimatedTime, 0);
  }

  /**
   * 取消执行
   * @param sessionId 会话ID
   * @returns 是否成功取消
   */
  async cancelExecution(sessionId: string): Promise<boolean> {
    const context = this.activeExecutions.get(sessionId);
    if (!context) {
      return false;
    }
    
    console.log('🛑 取消执行:', sessionId);
    
    // 清理活跃执行
    this.activeExecutions.delete(sessionId);
    
    // 记录取消结果
    const cancelResult: OrchestrationResult = {
      success: false,
      error: '用户取消执行',
      executionTime: Date.now() - context.startTime.getTime(),
      stepsExecuted: [],
      agentResults: new Map(),
      metadata: {
        sessionId,
        userId: context.userId,
        timestamp: new Date(),
        totalSteps: context.executionPlan.steps.length,
        successfulSteps: context.currentStep,
        failedSteps: 0
      }
    };
    
    this.executionHistory.set(sessionId, cancelResult);
    return true;
  }

  /**
   * 获取执行历史
   * @param sessionId 会话ID
   * @returns 执行历史
   */
  getExecutionHistory(sessionId: string): OrchestrationResult | null {
    return this.executionHistory.get(sessionId) || null;
  }

  /**
   * 获取系统统计信息
   * @returns 统计信息
   */
  getSystemStats(): any {
    return {
      activeExecutions: this.activeExecutions.size,
      totalExecutions: this.executionHistory.size,
      successRate: this.calculateSuccessRate(),
      averageExecutionTime: this.calculateAverageExecutionTime()
    };
  }

  /**
   * 计算成功率
   */
  private calculateSuccessRate(): number {
    const results = Array.from(this.executionHistory.values());
    if (results.length === 0) return 0;
    
    const successful = results.filter(r => r.success).length;
    return successful / results.length;
  }

  /**
   * 计算平均执行时间
   */
  private calculateAverageExecutionTime(): number {
    const results = Array.from(this.executionHistory.values());
    if (results.length === 0) return 0;
    
    const totalTime = results.reduce((sum, r) => sum + r.executionTime, 0);
    return totalTime / results.length;
  }
}
