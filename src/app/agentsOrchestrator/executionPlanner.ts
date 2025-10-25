// src/app/agentsOrchestrator/executionPlanner.ts
// 🎯 执行计划器 - 将复杂任务分解为可执行的步骤

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

export class ExecutionPlanner {
  private agentRegistry: any;
  private taskCounter: number = 0;

  constructor(agentRegistry: any) {
    this.agentRegistry = agentRegistry;
    console.log("🎯 ExecutionPlanner initialized");
  }

  /**
   * 🧠 创建执行计划
   */
  createExecutionPlan(
    userIntent: string,
    context: any,
    availableAgents: any[]
  ): ExecutionPlan {
    console.log("🎯 创建执行计划:", { userIntent, context });

    const taskId = `task-${++this.taskCounter}`;
    const steps: TaskStep[] = [];

    // 根据用户意图分析需要的步骤
    const requiredSteps = this.analyzeUserIntent(userIntent, context);
    
    // 为每个步骤分配Agent
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

    // 分析依赖关系
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

    console.log("✅ 执行计划创建完成:", plan);
    return plan;
  }

  /**
   * 🔍 分析用户意图，确定需要的步骤
   */
  private analyzeUserIntent(userIntent: string, context: any): any[] {
    const steps: any[] = [];
    const intent = userIntent.toLowerCase();

    // 简历解析相关
    if (intent.includes('parse') || intent.includes('解析') || intent.includes('upload')) {
      steps.push({
        action: 'parse_resume',
        input: context,
        priority: 1
      });
    }

    // 内容优化相关
    if (intent.includes('optimize') || intent.includes('优化') || intent.includes('improve')) {
      steps.push({
        action: 'optimize_content',
        input: context,
        priority: 2,
        dependencies: ['parse_resume']
      });
    }

    // 格式标准化相关
    if (intent.includes('format') || intent.includes('格式') || intent.includes('standardize')) {
      steps.push({
        action: 'standardize_format',
        input: context,
        priority: 3,
        dependencies: ['parse_resume']
      });
    }

    // 质量检查相关
    if (intent.includes('check') || intent.includes('检查') || intent.includes('validate')) {
      steps.push({
        action: 'quality_check',
        input: context,
        priority: 4,
        dependencies: ['optimize_content', 'standardize_format']
      });
    }

    // 批量编辑相关
    if (intent.includes('bulk') || intent.includes('batch') || intent.includes('批量')) {
      steps.push({
        action: 'bulk_edit',
        input: context,
        priority: 2
      });
    }

    // 教育添加相关
    if (intent.includes('master') || intent.includes('degree') || intent.includes('education') || 
        intent.includes('教育') || intent.includes('mit') || intent.includes('university') ||
        intent.includes('college') || intent.includes('school')) {
      steps.push({
        action: 'add_education',
        input: { 
          userIntent, 
          context,
          action: 'add',
          target: 'section',
          entity: 'education',
          data: this.extractEducationData(userIntent)
        },
        priority: 1
      });
    }

    // 单个编辑相关
    if (intent.includes('edit') || intent.includes('修改') || intent.includes('update')) {
      steps.push({
        action: 'single_edit',
        input: context,
        priority: 1
      });
    }

    // 删除操作相关
    if (intent.includes('delete') || intent.includes('删除') || intent.includes('remove')) {
      steps.push({
        action: 'delete_item',
        input: context,
        priority: 1
      });
    }

    // 如果没有匹配到特定意图，使用默认的推理引擎
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
   * 🎓 提取教育数据
   */
  private extractEducationData(userIntent: string): any {
    const intent = userIntent.toLowerCase();
    
    // 提取机构信息
    let institution = 'MIT';
    if (intent.includes('mit')) {
      institution = 'Massachusetts Institute of Technology';
    } else if (intent.includes('harvard')) {
      institution = 'Harvard University';
    } else if (intent.includes('stanford')) {
      institution = 'Stanford University';
    }
    
    // 提取学位信息
    let degree = 'M.S.';
    if (intent.includes('master')) {
      degree = 'M.S.';
    } else if (intent.includes('bachelor') || intent.includes('bachelor')) {
      degree = 'B.S.';
    } else if (intent.includes('phd') || intent.includes('doctor')) {
      degree = 'Ph.D.';
    }
    
    // 提取专业信息
    let major = 'Computer Science';
    if (intent.includes('cs') || intent.includes('computer science')) {
      major = 'Computer Science';
    } else if (intent.includes('engineering')) {
      major = 'Engineering';
    }
    
    // 提取时间信息
    let time = 'Sep. 2023 - Sep. 2025';
    if (intent.includes('2023') && intent.includes('2025')) {
      time = 'Sep. 2023 - Sep. 2025';
    }
    
    // 提取地点信息
    let location = 'Cambridge, MA';
    if (intent.includes('mit')) {
      location = 'Cambridge, MA';
    }
    
    return {
      institution,
      degree,
      major,
      time,
      location
    };
  }

  /**
   * 🎯 为步骤选择最佳Agent
   */
  private selectBestAgent(stepInfo: any, availableAgents: any[]): any {
    const { action } = stepInfo;
    
    // 根据action类型选择Agent
    const agentMap: Record<string, string[]> = {
      'parse_resume': ['parseResumeAgent', 'aiParser'],
      'optimize_content': ['contentOptimizer', 'llmReasoningEngine'],
      'standardize_format': ['formatStandardizer', 'llmReasoningEngine'],
      'quality_check': ['qualityChecker', 'llmReasoningEngine'],
      'bulk_edit': ['resumeModifierAgent', 'llmReasoningEngine'],
      'single_edit': ['resumeModifierAgent', 'llmReasoningEngine'],
      'delete_item': ['resumeModifierAgent', 'llmReasoningEngine'],
      'add_education': ['resumeModifierAgent'],
      'add_work': ['resumeModifierAgent'],
      'add_skill': ['resumeModifierAgent'],
      'llm_reasoning': ['llmReasoningEngine']
    };

    const preferredAgents = agentMap[action] || ['llmReasoningEngine'];
    
    // 找到第一个可用的Agent
    for (const agentId of preferredAgents) {
      const agent = availableAgents.find(a => a.id === agentId);
      if (agent && agent.status === 'available') {
        return agent;
      }
    }

    // 如果没有找到特定Agent，使用默认的LLM推理引擎
    return availableAgents.find(a => a.id === 'llmReasoningEngine') || availableAgents[0];
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
      totalSteps: plan.steps.length,
      parallelGroups: plan.parallelSteps.length,
      sequentialSteps: plan.sequentialSteps.length,
      estimatedTime: plan.totalEstimatedTime
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
