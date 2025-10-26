// src/app/agents/editAgent.ts
// ✏️ 推理驱动的编辑Agent - 真正的AI智能编辑系统

import { ReasoningEngine, ActionPlan } from './reasoningEngine';
import { DynamicExecutor, ExecutionSummary } from './dynamicExecutor';

// 结构化日志记录
const logStage = (stage: string, data: any = {}) => {
  const timestamp = new Date().toISOString();
  console.log(`✏️ [${timestamp}] ${stage}:`, data);
};

// 发送反馈到LLM推理引擎
const sendFeedback = async (userId: string, reasoning: any, success: boolean, executionSummary: ExecutionSummary) => {
  try {
    const feedbackData = {
      userId,
      reasoning: {
        intent: reasoning.intent,
        entities: reasoning.entities,
        action: 'edit' as const,
        target: 'field' as const,
        entity: reasoning.intent,
        data: reasoning.entities,
        confidence: reasoning.confidence,
        reasoning: reasoning.reasoningSteps?.join('; ') || 'Edit operation executed',
        reasoningSteps: reasoning.reasoningSteps || []
      },
      success,
      executionSummary,
      timestamp: new Date().toISOString()
    };
    
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/llm-reasoning/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedbackData)
    });
    
    logStage("feedback-sent", { success, executionSummary });
  } catch (error) {
    logStage("feedback-error", { error: error instanceof Error ? error.message : 'Unknown error' });
  }
};

export class EditAgent {
  private reasoningEngine: ReasoningEngine;
  private dynamicExecutor: DynamicExecutor;

  constructor() {
    this.reasoningEngine = new ReasoningEngine();
    this.dynamicExecutor = new DynamicExecutor();
  }

  /**
   * 🧠 推理驱动的执行方法 - 无硬编码逻辑
   */
  async execute(entities: any, context: any): Promise<{ success: boolean; message: string; updatedResume?: any }> {
    logStage("intent-received", { entities, contextKeys: Object.keys(context) });
    
    try {
      // 🧠 提取用户输入和上下文
      const userInput = this.extractUserInput(entities, context);
      const userId = context.userId || 'default';
      
      logStage("reasoning-start", { 
        userInput,
        userId,
        hasContext: !!context.sections
      });

      // 🧠 使用推理引擎规划行动链
      const actionPlan = await this.reasoningEngine.planActionChain(
        userInput,
        { sections: context.sections || [] },
        userId
      );

      logStage("action-plan-generated", {
        intent: actionPlan.intent,
        confidence: actionPlan.confidence,
        steps: actionPlan.steps.length,
        reasoning: actionPlan.reasoning
      });

      // 🎯 使用动态执行器执行计划
      const executionSummary = await this.dynamicExecutor.executePlan(
        actionPlan,
        { sections: context.sections || [] },
        userId
      );

      logStage("execution-completed", {
        success: executionSummary.success,
        totalSteps: executionSummary.totalSteps,
        successfulSteps: executionSummary.successfulSteps,
        failedSteps: executionSummary.failedSteps,
        executionTime: `${executionSummary.executionTime}ms`
      });

      // 🧠 构建推理信息用于反馈
      const reasoning = {
        intent: actionPlan.intent,
        entities: entities,
        confidence: actionPlan.confidence,
        reasoningSteps: actionPlan.steps.map(step => step.reasoning)
      };

      // 发送反馈
      await sendFeedback(userId, reasoning, executionSummary.success, executionSummary);

      if (executionSummary.success) {
        const message = this.generateSuccessMessage(executionSummary, actionPlan);
        return {
          success: true,
          message,
          updatedResume: executionSummary.finalResume.sections
        };
      } else {
        const message = this.generateFailureMessage(executionSummary, actionPlan);
        return {
          success: false,
          message
        };
      }

    } catch (error) {
      logStage("execution-error", { error: error instanceof Error ? error.message : 'Unknown error' });
      return {
        success: false,
        message: `❌ 编辑操作失败: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * 🔍 从实体和上下文中提取用户输入
   */
  private extractUserInput(entities: any, context: any): string {
    // 如果有明确的用户输入，使用它
    if (entities.userInput) {
      return entities.userInput;
    }

    // 否则从实体构建用户输入
    const parts: string[] = [];
    
    if (entities.section) {
      parts.push(`in ${entities.section} section`);
    }
    
    if (entities.action) {
      parts.push(entities.action);
    }
    
    if (entities.keyword) {
      parts.push(`keyword "${entities.keyword}"`);
    }
    
    if (entities.newContent) {
      parts.push(`to "${entities.newContent}"`);
    }

    return parts.join(' ') || 'edit resume content';
  }

  /**
   * ✅ 生成成功消息
   */
  private generateSuccessMessage(executionSummary: ExecutionSummary, actionPlan: ActionPlan): string {
    const { successfulSteps, totalSteps } = executionSummary;
    
    if (successfulSteps === totalSteps) {
      return `✅ 成功完成编辑操作：${actionPlan.intent}`;
    } else {
      return `✅ 部分完成编辑操作：${successfulSteps}/${totalSteps} 步骤成功`;
    }
  }

  /**
   * ❌ 生成失败消息
   */
  private generateFailureMessage(executionSummary: ExecutionSummary, actionPlan: ActionPlan): string {
    const { failedSteps, totalSteps } = executionSummary;
    
    if (failedSteps === totalSteps) {
      return `❌ 编辑操作失败：所有 ${totalSteps} 步骤都失败了`;
    } else {
      return `❌ 编辑操作部分失败：${failedSteps}/${totalSteps} 步骤失败`;
    }
  }
}