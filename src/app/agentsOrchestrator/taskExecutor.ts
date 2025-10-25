// src/app/agentsOrchestrator/taskExecutor.ts
// 🚀 任务执行器 - 执行具体的任务计划

import { ExecutionPlan, TaskStep } from './executionPlanner';

export interface ExecutionResult {
  stepId: string;
  success: boolean;
  result?: any;
  error?: string;
  executionTime: number;
  timestamp: Date;
}

export interface TaskExecutionStatus {
  planId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  currentStep?: string;
  completedSteps: string[];
  failedSteps: string[];
  results: ExecutionResult[];
  startTime?: Date;
  endTime?: Date;
  progress: number;
}

export class TaskExecutor {
  private agentRegistry: any;
  private activeExecutions: Map<string, TaskExecutionStatus> = new Map();
  private executionHistory: ExecutionResult[] = [];

  constructor(agentRegistry: any) {
    this.agentRegistry = agentRegistry;
    console.log("🚀 TaskExecutor initialized");
  }

  /**
   * 🎯 执行任务计划
   */
  async executePlan(plan: ExecutionPlan): Promise<TaskExecutionStatus> {
    console.log("🚀 开始执行计划:", plan.id);

    const executionStatus: TaskExecutionStatus = {
      planId: plan.id,
      status: 'running',
      completedSteps: [],
      failedSteps: [],
      results: [],
      startTime: new Date(),
      progress: 0
    };

    this.activeExecutions.set(plan.id, executionStatus);

    try {
      // 按依赖关系执行步骤
      await this.executeSequentialSteps(plan, executionStatus);
      await this.executeParallelSteps(plan, executionStatus);

      // 更新状态
      executionStatus.status = 'completed';
      executionStatus.endTime = new Date();
      executionStatus.progress = 100;

      console.log("✅ 计划执行完成:", plan.id);
    } catch (error) {
      console.error("❌ 计划执行失败:", plan.id, error);
      executionStatus.status = 'failed';
      executionStatus.endTime = new Date();
    }

    return executionStatus;
  }

  /**
   * 🔄 执行串行步骤
   */
  private async executeSequentialSteps(
    plan: ExecutionPlan, 
    status: TaskExecutionStatus
  ): Promise<void> {
    for (const stepId of plan.sequentialSteps) {
      const step = plan.steps.find(s => s.id === stepId);
      if (!step) continue;

      status.currentStep = stepId;
      console.log(`🔄 执行串行步骤: ${stepId}`);

      const result = await this.executeStep(step);
      status.results.push(result);

      if (result.success) {
        status.completedSteps.push(stepId);
        console.log(`✅ 串行步骤完成: ${stepId}`);
      } else {
        status.failedSteps.push(stepId);
        console.error(`❌ 串行步骤失败: ${stepId}`, result.error);
        
        // 如果关键步骤失败，停止执行
        if (step.priority <= 2) {
          throw new Error(`关键步骤失败: ${stepId}`);
        }
      }

      // 更新进度
      status.progress = (status.completedSteps.length / plan.steps.length) * 100;
    }
  }

  /**
   * ⚡ 执行并行步骤
   */
  private async executeParallelSteps(
    plan: ExecutionPlan, 
    status: TaskExecutionStatus
  ): Promise<void> {
    for (const parallelGroup of plan.parallelSteps) {
      console.log(`⚡ 执行并行步骤组:`, parallelGroup);

      // 并行执行组内的所有步骤
      const promises = parallelGroup.map(stepId => {
        const step = plan.steps.find(s => s.id === stepId);
        if (!step) return Promise.resolve();

        return this.executeStep(step).then(result => {
          status.results.push(result);
          
          if (result.success) {
            status.completedSteps.push(stepId);
            console.log(`✅ 并行步骤完成: ${stepId}`);
          } else {
            status.failedSteps.push(stepId);
            console.error(`❌ 并行步骤失败: ${stepId}`, result.error);
          }
        });
      });

      // 等待所有并行步骤完成
      await Promise.allSettled(promises);

      // 更新进度
      status.progress = (status.completedSteps.length / plan.steps.length) * 100;
    }
  }

  /**
   * 🎯 执行单个步骤
   */
  private async executeStep(step: TaskStep): Promise<ExecutionResult> {
    const startTime = Date.now();
    const timestamp = new Date();

    try {
      console.log(`🎯 执行步骤: ${step.id} (Agent: ${step.agentId})`);

      // 获取Agent
      const agent = this.agentRegistry.getAgent(step.agentId);
      if (!agent) {
        throw new Error(`Agent not found: ${step.agentId}`);
      }

      // 执行Agent
      const result = await this.invokeAgent(agent, step);
      const executionTime = Date.now() - startTime;

      const executionResult: ExecutionResult = {
        stepId: step.id,
        success: true,
        result,
        executionTime,
        timestamp
      };

      this.executionHistory.push(executionResult);
      return executionResult;

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      console.error(`❌ 步骤执行失败: ${step.id}`, errorMessage);

      const executionResult: ExecutionResult = {
        stepId: step.id,
        success: false,
        error: errorMessage,
        executionTime,
        timestamp
      };

      this.executionHistory.push(executionResult);

      // 重试逻辑
      if (step.retryCount < step.maxRetries) {
        step.retryCount++;
        console.log(`🔄 重试步骤: ${step.id} (${step.retryCount}/${step.maxRetries})`);
        
        // 等待一段时间后重试
        await new Promise(resolve => setTimeout(resolve, 1000 * step.retryCount));
        return this.executeStep(step);
      }

      return executionResult;
    }
  }

  /**
   * 🤖 调用Agent执行任务
   */
  private async invokeAgent(agent: any, step: TaskStep): Promise<any> {
    const { action, input } = step;

    switch (agent.id) {
      case 'llmReasoningEngine':
        return await this.invokeLLMReasoningEngine(input);
      
      case 'parseResumeAgent':
        return await this.invokeParseResumeAgent(input);
      
      case 'actionExecutor':
        return await this.invokeActionExecutor(input);
      
      default:
        // 通用Agent调用
        if (agent.execute) {
          return await agent.execute(action, input);
        } else {
          throw new Error(`Agent ${agent.id} does not support execution`);
        }
    }
  }

  /**
   * 🧠 调用LLM推理引擎
   */
  private async invokeLLMReasoningEngine(input: any): Promise<any> {
    const response = await fetch('/api/llm-reasoning', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });

    if (!response.ok) {
      throw new Error(`LLM推理失败: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * 📄 调用简历解析Agent
   */
  private async invokeParseResumeAgent(input: any): Promise<any> {
    const response = await fetch('/api/parseResume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });

    if (!response.ok) {
      throw new Error(`简历解析失败: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * ⚡ 调用Action执行器
   */
  private async invokeActionExecutor(input: any): Promise<any> {
    // ActionExecutor通常通过LLM推理引擎调用
    return await this.invokeLLMReasoningEngine(input);
  }

  /**
   * 📊 获取执行状态
   */
  getExecutionStatus(planId: string): TaskExecutionStatus | undefined {
    return this.activeExecutions.get(planId);
  }

  /**
   * 📈 获取执行历史
   */
  getExecutionHistory(): ExecutionResult[] {
    return [...this.executionHistory];
  }

  /**
   * 🧹 清理完成的执行
   */
  cleanupCompletedExecutions(): void {
    for (const [planId, status] of this.activeExecutions.entries()) {
      if (status.status === 'completed' || status.status === 'failed') {
        this.activeExecutions.delete(planId);
      }
    }
  }

  /**
   * 🛑 停止执行
   */
  stopExecution(planId: string): boolean {
    const status = this.activeExecutions.get(planId);
    if (status && status.status === 'running') {
      status.status = 'failed';
      status.endTime = new Date();
      return true;
    }
    return false;
  }
}
