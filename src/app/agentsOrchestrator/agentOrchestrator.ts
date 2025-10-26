// src/app/agentsOrchestrator/agentOrchestrator.ts
// 🎯 Agent编排器 - 智能协调多个AI Agent的执行

import { ExecutionPlanner } from './executionPlanner';
import { TaskExecutor } from './taskExecutor';
import { ResultAggregator } from './resultAggregator';
import { 
  getAvailableAgents, 
  selectAgentForTask, 
  executeTask, 
  getAgentStats,
  findAgentByCapability,
  findBestAgentByCapabilities
} from '../agents/agentRegistry';

export interface OrchestrationRequest {
  userInput: string;
  context: any;
  userId: string;
  priority?: 'low' | 'medium' | 'high';
  timeout?: number;
}

export interface OrchestrationResult {
  success: boolean;
  result?: any;
  error?: string;
  executionTime: number;
  agentsUsed: string[];
  confidence: number;
  suggestions?: string[];
  planId?: string;
}

export class AgentOrchestrator {
  private executionPlanner: ExecutionPlanner;
  private taskExecutor: TaskExecutor;
  private resultAggregator: ResultAggregator;
  private executionHistory: Map<string, OrchestrationResult[]> = new Map();

  constructor() {
    this.executionPlanner = new ExecutionPlanner();
    this.taskExecutor = new TaskExecutor();
    this.resultAggregator = new ResultAggregator();
    console.log("🎯 AgentOrchestrator initialized with dynamic agent registry");
  }

  /**
   * 🚀 执行编排请求
   */
  async executeRequest(request: OrchestrationRequest): Promise<OrchestrationResult> {
    const startTime = Date.now();
    console.log("🎯 执行编排请求:", request.userInput);

    try {
      // 1. 分析任务复杂度
      const complexity = this.analyzeComplexity(request.userInput, request.context);
      console.log("📊 任务复杂度:", complexity);

      // 2. 根据复杂度选择执行策略
      if (complexity === 'simple') {
        return await this.executeSimpleTask(request, startTime);
      } else {
        return await this.executeComplexTask(request, startTime);
      }

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      console.error("❌ 编排执行失败:", errorMessage);

      return {
        success: false,
        error: errorMessage,
        executionTime,
        agentsUsed: ['none'],
        confidence: 0
      };
    }
  }

  /**
   * ⚡ Execute simple task (patched version)
   * Ensures that even simple actions run through ExecutionPlanner + TaskExecutor
   */
  private async executeSimpleTask(
    request: OrchestrationRequest,
    startTime: number
  ): Promise<OrchestrationResult> {
    console.log("⚡ [Patched] Executing simple task with full orchestration chain");

    // 1️⃣ Collect available agents
    const availableAgents = getAvailableAgents();
    console.log("🧩 Active agents:", availableAgents.map((a: any) => a.id));

    // 2️⃣ Create an execution plan
    const plan = await this.executionPlanner.createExecutionPlan(
      request.userInput,
      request.context,
      availableAgents
    );
    console.log("📋 Simple task plan created:", this.executionPlanner.getPlanStats(plan));

    // 3️⃣ Execute the plan
    const executionStatus = await this.taskExecutor.executePlan(plan);
    console.log("🚀 Simple task execution finished:", executionStatus.status);

    // 4️⃣ Aggregate results
    const aggregatedResult = this.resultAggregator.aggregateResults(
      executionStatus,
      executionStatus.results
    );

    // 5️⃣ Record result
    const executionTime = Date.now() - startTime;
    
    // 提取更新后的简历数据
    const updatedResume = this.extractUpdatedResume(executionStatus.results);
    console.log("🔍 提取的简历数据:", updatedResume);
    console.log("🔍 执行结果:", executionStatus.results);
    
    const result: OrchestrationResult = {
      success: aggregatedResult.success,
      result: {
        updatedResume: updatedResume,
        planId: plan.id
      },
      error: aggregatedResult.errors.join("; "),
      executionTime,
      agentsUsed: executionStatus.results.map((r) => r.stepId),
      confidence: aggregatedResult.success ? 0.9 : 0.3,
      suggestions: this.generateComplexSuggestions(aggregatedResult),
      planId: plan.id,
    };

    this.recordExecution(request.userId, result);
    return result;
  }

  /**
   * 📄 提取更新后的简历数据
   */
  private extractUpdatedResume(results: any[]): any {
    // 从执行结果中提取最新的简历数据
    for (const result of results.reverse()) {
      if (result.success && result.result) {
        if (result.result.sections) {
          return { sections: result.result.sections };
        }
        if (result.result.updatedResume) {
          return result.result.updatedResume;
        }
        if (result.result.data && result.result.data.sections) {
          return { sections: result.result.data.sections };
        }
      }
    }
    
    // 如果没有找到更新数据，返回空结构
    return { sections: [] };
  }

  /**
   * 🎯 执行复杂任务
   */
  private async executeComplexTask(
    request: OrchestrationRequest, 
    startTime: number
  ): Promise<OrchestrationResult> {
    console.log("🎯 执行复杂任务");

    // 1. 创建执行计划
    const availableAgents = getAvailableAgents();
    const plan = await this.executionPlanner.createExecutionPlan(
      request.userInput,
      request.context,
      availableAgents
    );

    console.log("📋 执行计划创建完成:", this.executionPlanner.getPlanStats(plan));

    // 2. 执行任务计划
    const executionStatus = await this.taskExecutor.executePlan(plan);
    console.log("🚀 任务执行完成:", executionStatus.status);

    // 3. 聚合结果
    const aggregatedResult = this.resultAggregator.aggregateResults(
      executionStatus,
      executionStatus.results
    );

    const executionTime = Date.now() - startTime;
    const agentsUsed = executionStatus.results.map(r => r.stepId);

    // 4. 记录执行历史
    const result: OrchestrationResult = {
      success: aggregatedResult.success,
      result: aggregatedResult.data,
      error: aggregatedResult.errors.join('; '),
      executionTime,
      agentsUsed,
      confidence: aggregatedResult.success ? 0.9 : 0.3,
      suggestions: this.generateComplexSuggestions(aggregatedResult),
      planId: plan.id
    };

    this.recordExecution(request.userId, result);

    return result;
  }

  /**
   * 📊 分析任务复杂度
   */
  private analyzeComplexity(userInput: string, context: any): 'simple' | 'medium' | 'complex' {
    const input = userInput.toLowerCase();
    
    // 复杂任务关键词
    const complexKeywords = [
      'optimize', 'improve', 'enhance', 'restructure', 'reorganize',
      'optimize resume', 'improve content', 'enhance format',
      'bulk edit', 'batch process', 'multiple',
      '优化', '改进', '增强', '重构', '重组',
      '优化简历', '改进内容', '增强格式', '批量编辑'
    ];
    
    // 简单任务关键词
    const simpleKeywords = [
      'edit', 'delete', 'add', 'update', 'modify',
      '编辑', '删除', '添加', '更新', '修改'
    ];
    
    if (complexKeywords.some(keyword => input.includes(keyword))) {
      return 'complex';
    }
    
    if (simpleKeywords.some(keyword => input.includes(keyword))) {
      return 'simple';
    }
    
    return 'medium';
  }

  /**
   * 🤖 使用指定Agent执行任务
   */
  private async executeWithAgent(agent: any, request: OrchestrationRequest): Promise<any> {
    console.log("🤖 使用Agent执行:", agent.id);

    switch (agent.id) {
      case 'llmReasoningEngine':
        return await this.executeLLMReasoning(request);
      
      case 'parseResumeAgent':
        return await this.executeParseResume(request);
      
      case 'contentOptimizer':
        return await this.executeContentOptimization(request);
      
      default:
        throw new Error(`Unknown agent: ${agent.id}`);
    }
  }

  /**
   * 🧠 执行LLM推理
   */
  private async executeLLMReasoning(request: OrchestrationRequest): Promise<any> {
    const response = await fetch('/api/llm-reasoning', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userInput: request.userInput,
        currentResume: request.context,
        userId: request.userId
      })
    });

    if (!response.ok) {
      throw new Error(`LLM推理失败: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * 📄 执行简历解析
   */
  private async executeParseResume(request: OrchestrationRequest): Promise<any> {
    const response = await fetch('/api/parseResume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request.context)
    });

    if (!response.ok) {
      throw new Error(`简历解析失败: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * ⚡ 执行内容优化
   */
  private async executeContentOptimization(request: OrchestrationRequest): Promise<any> {
    // 内容优化通常通过LLM推理引擎实现
    return await this.executeLLMReasoning(request);
  }

  /**
   * 📝 记录执行历史
   */
  private recordExecution(userId: string, result: OrchestrationResult): void {
    if (!this.executionHistory.has(userId)) {
      this.executionHistory.set(userId, []);
    }
    
    const history = this.executionHistory.get(userId)!;
    history.push(result);
    
    // 保持历史记录在合理范围内
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
  }

  /**
   * 💡 生成简单任务建议
   */
  private generateSuggestions(result: any): string[] {
    const suggestions: string[] = [];
    
    if (result && result.data) {
      suggestions.push("操作已成功完成");
      
      if (result.data.sections && result.data.sections.length > 0) {
        suggestions.push(`处理了 ${result.data.sections.length} 个sections`);
      }
    }
    
    return suggestions;
  }

  /**
   * 💡 生成复杂任务建议
   */
  private generateComplexSuggestions(aggregatedResult: any): string[] {
    const suggestions: string[] = [];
    
    if (aggregatedResult.success) {
      suggestions.push("复杂任务执行完成");
      
      if (aggregatedResult.agentResults) {
        const agentCount = Object.keys(aggregatedResult.agentResults).length;
        suggestions.push(`使用了 ${agentCount} 个AI Agent`);
      }
      
      if (aggregatedResult.warnings && aggregatedResult.warnings.length > 0) {
        suggestions.push(`${aggregatedResult.warnings.length} 个冲突已自动解决`);
      }
    } else {
      suggestions.push("任务执行遇到问题");
      
      if (aggregatedResult.errors && aggregatedResult.errors.length > 0) {
        suggestions.push(`发现 ${aggregatedResult.errors.length} 个错误`);
      }
    }
    
    return suggestions;
  }

  /**
   * 📊 获取执行统计
   */
  getExecutionStats(userId: string): {
    totalExecutions: number;
    successRate: number;
    averageExecutionTime: number;
    mostUsedAgents: string[];
    complexTaskCount: number;
  } {
    const history = this.executionHistory.get(userId) || [];
    
    const totalExecutions = history.length;
    const successfulExecutions = history.filter(h => h.success).length;
    const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0;
    
    const averageExecutionTime = totalExecutions > 0 
      ? history.reduce((sum, h) => sum + h.executionTime, 0) / totalExecutions 
      : 0;
    
    const agentUsage = new Map<string, number>();
    history.forEach(h => {
      h.agentsUsed.forEach(agent => {
        agentUsage.set(agent, (agentUsage.get(agent) || 0) + 1);
      });
    });
    
    const mostUsedAgents = Array.from(agentUsage.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([agent]) => agent);
    
    const complexTaskCount = history.filter(h => h.planId).length;
    
    return {
      totalExecutions,
      successRate,
      averageExecutionTime,
      mostUsedAgents,
      complexTaskCount
    };
  }

  /**
   * 🧹 清理历史记录
   */
  cleanupHistory(): void {
    this.executionHistory.clear();
    this.taskExecutor.cleanupCompletedExecutions();
    console.log("🧹 执行历史已清理");
  }

  /**
   * 📊 获取系统状态
   */
  getSystemStatus(): {
    activeAgents: number;
    activeExecutions: number;
    systemHealth: 'healthy' | 'degraded' | 'unhealthy';
  } {
    const { available, busy, total } = getAgentStats();
    const activeAgents = available + busy;
    const activeExecutions = this.taskExecutor['activeExecutions'].size;
    
    let systemHealth: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (activeAgents < 2) {
      systemHealth = 'degraded';
    }
    if (activeAgents === 0) {
      systemHealth = 'unhealthy';
    }
    
    return {
      activeAgents,
      activeExecutions,
      systemHealth
    };
  }
}