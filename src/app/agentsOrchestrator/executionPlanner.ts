// src/app/agentsOrchestrator/executionPlanner.ts
// 🎯 执行计划器 - 将复杂任务分解为可执行的步骤

import { selectAgentForTask, findBestAgentByCapabilities } from '../agents/agentRegistry';

export interface TaskStep {
  id: string;
  agentId: string;
  action: string;
  input: any;
  dependencies: string[];
  priority: number;
  estimatedTime: number;
  retryCount: number;
  maxRetries: number;
}

export interface ExecutionPlan {
  id: string;
  taskId: string;
  steps: TaskStep[];
  totalEstimatedTime: number;
  parallelSteps: string[][];
  sequentialSteps: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface LLMReasoningResult {
  intent: string;
  entities: Record<string, any>;
  confidence?: number;
  reasoning?: string;
}

export class ExecutionPlanner {
  private taskCounter: number = 0;

  constructor() {
    console.log("🎯 ExecutionPlanner initialized with dynamic agent registry");
  }

  /**
   * 🧠 创建执行计划（智能版本）
   */
  async createExecutionPlan(
    userIntent: string,
    context: any,
    availableAgents: any[]
  ): Promise<ExecutionPlan> {
    console.log("🎯 创建智能执行计划:", { userIntent, context });
    console.log("🎯 可用Agents:", availableAgents.map(a => a.id));

    const taskId = `task-${++this.taskCounter}`;
    const steps: TaskStep[] = [];

    // 1. 使用LLM推理引擎分析用户意图
    console.log("🧠 开始LLM意图分析:", userIntent);
    const reasoningResult = await this.analyzeIntentWithLLM(userIntent, context);
    console.log("🧠 LLM推理结果:", reasoningResult);
    console.log("🧠 推理结果类型:", typeof reasoningResult);
    console.log("🧠 推理结果是否为null:", reasoningResult === null);
    console.log("🧠 推理结果是否有intent:", reasoningResult && reasoningResult.intent);

    // 2. 基于推理结果生成结构化步骤
    if (reasoningResult && reasoningResult.intent) {
      console.log("✅ 使用LLM推理结果创建步骤");
      console.log("📋 推理结果详情:", JSON.stringify(reasoningResult, null, 2));
      const step = this.createStepFromReasoning(reasoningResult, taskId, availableAgents, context);
      if (step) {
        console.log("✅ 步骤创建成功:", step.id, "->", step.agentId);
        steps.push(step);
      } else {
        console.log("❌ 步骤创建失败");
      }
    } else {
      console.log("❌ LLM推理结果无效，回退到传统方法");
      console.log("🔍 推理结果:", reasoningResult);
    }

    // 3. 如果没有LLM推理结果，回退到传统方法
    if (steps.length === 0) {
      console.log("🔄 回退到传统意图分析");
      const requiredSteps = this.analyzeUserIntent(userIntent, context);
      
      for (const stepInfo of requiredSteps) {
        const agent = this.selectBestAgent(stepInfo, availableAgents);
        if (agent) {
          const step: TaskStep = {
            id: `step-${taskId}-${steps.length + 1}`,
            agentId: agent.id,
            action: stepInfo.action,
            input: stepInfo.input,
            dependencies: stepInfo.dependencies || [],
            priority: stepInfo.priority || 1,
            estimatedTime: agent.estimatedTime || 5000,
            retryCount: 0,
            maxRetries: 3
          };
          steps.push(step);
        }
      }
    }

    // 4. 分析依赖关系
    const { parallelSteps, sequentialSteps } = this.analyzeDependencies(steps);
    
    const totalEstimatedTime = steps.reduce((sum, step) => sum + step.estimatedTime, 0);

    const plan: ExecutionPlan = {
      id: `plan-${taskId}`,
      taskId,
      steps,
      totalEstimatedTime,
      parallelSteps,
      sequentialSteps,
      status: 'pending',
      createdAt: new Date()
    };

    console.log("✅ 智能执行计划创建完成:", plan);
    return plan;
  }

  /**
   * 🧠 使用LLM分析用户意图
   */
  private async analyzeIntentWithLLM(userIntent: string, context: any): Promise<any> {
    try {
      console.log("🧠 开始LLM意图分析:", userIntent);
      
      // 服务器端需要使用完整的URL
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const apiUrl = `${baseUrl}/api/llm-reasoning/analyze_intent`;
      console.log("🧠 调用API:", apiUrl);
      
      // 调用LLM推理引擎
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput: userIntent })
      });

      if (!response.ok) {
        throw new Error(`LLM推理失败: ${response.status}`);
      }

      const result = await response.json();
      console.log("🧠 LLM推理完成:", result);
      
      // 检查API响应是否成功
      if (result.success && result.intent) {
        return {
          intent: result.intent,
          entities: result.entities || {},
          confidence: result.confidence,
          reasoning: result.reasoning
        };
      } else {
        console.log("❌ LLM推理结果无效:", result);
        return null;
      }
    } catch (error) {
      console.error("❌ LLM推理失败:", error);
      console.error("❌ 错误详情:", error instanceof Error ? error.message : String(error));
      console.error("❌ 错误堆栈:", error instanceof Error ? error.stack : 'No stack trace');
      return null;
    }
  }

  /**
   * 🎯 基于LLM推理结果创建步骤（纯数据驱动）
   */
  private createStepFromReasoning(reasoningResult: LLMReasoningResult, taskId: string, availableAgents: any[], context: any): TaskStep | null {
    const { intent, entities } = reasoningResult;
    
    if (!intent || !entities) {
      return null;
    }

    // 🎯 智能选择Agent - 使用动态Registry路由
    console.log(`🎯 智能选择Agent用于意图: ${intent}`);
    
    // 根据意图类型动态选择所需能力
    const requiredCapabilities = this.getRequiredCapabilities(intent);
    console.log(`🎯 所需能力: ${requiredCapabilities.join(', ')}`);
    
    const agent = selectAgentForTask(intent, requiredCapabilities);
    if (!agent) {
      console.warn("⚠️ 未通过智能路由找到合适Agent，尝试回退...");
      const fallbackAgent = findBestAgentByCapabilities(requiredCapabilities);
      if (!fallbackAgent) {
        console.error("❌ 没有任何Agent可处理该任务");
        console.log("可用Agents:", availableAgents.map(a => `${a.id}(${a.capabilities.join(',')})`));
        return null;
      }
      console.log(`✅ 回退选择Agent: ${fallbackAgent.id} (${fallbackAgent.name})`);
      return this.createStepWithAgent(fallbackAgent, reasoningResult, taskId, context);
    }
    console.log(`✅ 动态选择Agent: ${agent.id} (${agent.name}) 用于意图: ${intent}`);
    return this.createStepWithAgent(agent, reasoningResult, taskId, context);
  }

  /**
   * 🎯 根据意图获取所需能力
   */
  private getRequiredCapabilities(intent: string): string[] {
    if (intent.includes('add_') || intent.includes('add ')) {
      return ['add', 'modify'];
    }
    if (intent.includes('edit_') || intent.includes('edit ')) {
      return ['edit', 'modify'];
    }
    if (intent.includes('delete_') || intent.includes('remove_') || intent.includes('delete ') || intent.includes('remove ')) {
      return ['remove', 'modify'];
    }
    if (intent.includes('optimize') || intent.includes('improve') || intent.includes('enhance')) {
      return ['optimize', 'improve', 'enhance'];
    }
    if (intent.includes('analyze') || intent.includes('evaluate')) {
      return ['analyze', 'evaluate'];
    }
    if (intent.includes('parse') || intent.includes('extract')) {
      return ['parse', 'extract'];
    }
    // 默认能力
    return ['add', 'modify'];
  }

  /**
   * 🎯 使用指定Agent创建步骤
   */
  private createStepWithAgent(agent: any, reasoningResult: LLMReasoningResult, taskId: string, context: any): TaskStep | null {
    const { intent, entities } = reasoningResult;
    
    // 根据意图类型确定实体类型
    const entityType = this.determineEntityType(intent);
    const mappedData = this.mapLLMEntitiesToAgentFormat(entities, entityType);
    
    console.log("🎯 实体类型:", entityType);
    console.log("🎯 映射后的数据:", mappedData);
    
    return {
      id: `step-${taskId}-1`,
      agentId: agent.id,
      action: intent,
      input: {
        action: this.getActionFromIntent(intent),
        target: 'section',
        entity: entityType,
        data: mappedData,
        sections: context.sections || []
      },
      dependencies: [],
      priority: 1,
      estimatedTime: 3000,
      retryCount: 0,
      maxRetries: 3
    };
  }

  /**
   * 🎯 根据意图确定实体类型
   */
  private determineEntityType(intent: string): string {
    if (intent.includes('work') || intent.includes('experience') || intent.includes('job')) return 'work';
    if (intent.includes('education') || intent.includes('degree') || intent.includes('university') || intent.includes('school')) return 'education';
    if (intent.includes('skill') || intent.includes('technology') || intent.includes('programming')) return 'skill';
    return 'general';
  }

  /**
   * 🔄 根据意图获取操作类型
   */
  private getActionFromIntent(intent: string): string {
    if (intent.startsWith('add_')) return 'add';
    if (intent.startsWith('edit_')) return 'edit';
    if (intent.startsWith('delete_')) return 'remove';
    if (intent.includes('optimize') || intent.includes('improve')) return 'optimize';
    return 'process';
  }

  /**
   * 🔄 将LLM实体数据映射为Agent期望的格式
   */
  private mapLLMEntitiesToAgentFormat(entities: Record<string, any>, entityType: string): Record<string, any> {
    const mappedData: Record<string, any> = {};

    switch (entityType) {
      case 'work':
        mappedData.company = entities.company || entities.company_name || 'Company Name';
        mappedData.position = entities.position || entities.job_title || 'Software Engineer';
        mappedData.time = entities.period || entities.duration || entities.start_date || '2023 - 2025';
        mappedData.location = entities.location || 'Remote';
        mappedData.description = entities.description || 'Worked on various projects...';
        break;

      case 'education':
        mappedData.institution = entities.institution || entities.school || 'University';
        mappedData.degree = entities.degree || 'Bachelor\'s Degree';
        mappedData.major = entities.major || entities.field_of_study || 'Computer Science';
        mappedData.time = entities.period || entities.duration || entities.graduation_year || '2020-2024';
        mappedData.location = entities.location || 'City, State';
        break;

      case 'skill':
        mappedData.skills = entities.skills || entities.technologies || ['General Skills'];
        mappedData.level = entities.level || 'Intermediate';
        break;

      default:
        // 通用处理：直接使用实体数据
        Object.assign(mappedData, entities);
    }

    return mappedData;
  }

  /**
   * 🔍 分析用户意图（Fallback方法）
   */
  private analyzeUserIntent(userIntent: string, context: any): any[] {
    const steps: any[] = [];
    const intent = userIntent.toLowerCase();

    // 简单的关键词匹配作为fallback
    if (intent.includes('work') || intent.includes('experience') || intent.includes('job')) {
      steps.push({
        action: 'add_work',
        input: { 
          userIntent, 
          context,
          action: 'add',
          target: 'section',
          entity: 'work',
          data: { company: 'Company', position: 'Position', time: '2023-2025' }
        },
        priority: 1
      });
    }

    if (intent.includes('education') || intent.includes('degree') || intent.includes('university')) {
      steps.push({
        action: 'add_education',
        input: { 
          userIntent, 
          context,
          action: 'add',
          target: 'section',
          entity: 'education',
          data: { institution: 'University', degree: 'Degree', time: '2020-2024' }
        },
        priority: 1
      });
    }

    // 默认fallback
    if (steps.length === 0) {
      steps.push({
        action: 'llm_reasoning',
        input: context,
        priority: 1
      });
    }

    return steps;
  }


  /**
   * 🎯 为步骤选择最佳Agent（智能版本）
   */
  private selectBestAgent(stepInfo: any, availableAgents: any[]): any {
    const { action } = stepInfo;
    console.log(`🎯 智能选择Agent用于任务: ${action}`);
    
    // 1️⃣ 优先智能选择
    const agent = selectAgentForTask(action, ['add', 'edit', 'optimize']);
    if (agent) {
      console.log(`✅ 智能路由选择Agent: ${agent.id} (${agent.name})`);
      return agent;
    }

    // 2️⃣ 如果失败，则按能力查找
    const best = findBestAgentByCapabilities(['add', 'modify']);
    if (best) {
      console.log(`✅ 能力匹配选择Agent: ${best.id} (${best.name})`);
      return best;
    }

    // 3️⃣ 最后兜底
    console.warn("⚠️ 使用默认Agent兜底");
    const fallbackAgent = availableAgents.find(a => a.status === 'available');
    if (fallbackAgent) {
      console.log(`✅ 兜底选择Agent: ${fallbackAgent.id} (${fallbackAgent.name})`);
    }
    return fallbackAgent || null;
  }

  /**
   * 🔗 分析步骤间的依赖关系
   */
  private analyzeDependencies(steps: TaskStep[]): {
    parallelSteps: string[][];
    sequentialSteps: string[];
  } {
    const parallelSteps: string[][] = [];
    const sequentialSteps: string[] = [];
    const processed = new Set<string>();

    // 按优先级排序
    const sortedSteps = [...steps].sort((a, b) => a.priority - b.priority);

    for (const step of sortedSteps) {
      if (processed.has(step.id)) continue;

      // 检查是否有依赖
      const hasDependencies = step.dependencies.length > 0;
      
      if (hasDependencies) {
        // 有依赖的步骤必须串行执行
        sequentialSteps.push(step.id);
        processed.add(step.id);
      } else {
        // 无依赖的步骤可以并行执行
        const parallelGroup = [step.id];
        processed.add(step.id);

        // 找到其他可以并行执行的步骤
        for (const otherStep of sortedSteps) {
          if (processed.has(otherStep.id)) continue;
          if (otherStep.dependencies.length === 0 && otherStep.priority === step.priority) {
            parallelGroup.push(otherStep.id);
            processed.add(otherStep.id);
          }
        }

        if (parallelGroup.length > 1) {
          parallelSteps.push(parallelGroup);
        } else {
          sequentialSteps.push(step.id);
        }
      }
    }

    return { parallelSteps, sequentialSteps };
  }

  /**
   * 📊 获取计划统计信息
   */
  getPlanStats(plan: ExecutionPlan): {
    totalSteps: number;
    parallelGroups: number;
    sequentialSteps: number;
    estimatedTime: number;
  } {
    return {
      totalSteps: plan.steps?.length || 0,
      parallelGroups: plan.parallelSteps?.length || 0,
      sequentialSteps: plan.sequentialSteps?.length || 0,
      estimatedTime: plan.totalEstimatedTime || 0
    };
  }

  /**
   * 🔄 更新计划状态
   */
  updatePlanStatus(plan: ExecutionPlan, status: ExecutionPlan['status']): ExecutionPlan {
    const updatedPlan = { ...plan, status };
    
    if (status === 'running' && !plan.startedAt) {
      updatedPlan.startedAt = new Date();
    }
    
    if (status === 'completed' || status === 'failed') {
      updatedPlan.completedAt = new Date();
    }

    return updatedPlan;
  }
}
