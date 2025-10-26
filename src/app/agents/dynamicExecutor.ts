// src/app/agents/dynamicExecutor.ts
// 🎯 Semantic Plan Executor - Executes reasoning plans with semantic understanding

import { ActionPlan, ReasoningStep, ExecutionResult } from './reasoningEngine';
import { SemanticActionRegistry } from './semanticActionRegistry';

export interface ExecutionContext {
  resumeData: any;
  userId: string;
  stepResults: Map<number, ExecutionResult>;
  currentStep: number;
  totalSteps: number;
}

export interface ExecutionSummary {
  success: boolean;
  totalSteps: number;
  successfulSteps: number;
  failedSteps: number;
  results: ExecutionResult[];
  finalResume: any;
  executionTime: number;
}

export class DynamicExecutor {
  private executionHistory: Map<string, any[]> = new Map();
  private semanticRegistry: SemanticActionRegistry;

  constructor() {
    this.semanticRegistry = new SemanticActionRegistry();
  }

  /**
   * 🎯 Execute complete action plan dynamically
   */
  async executePlan(plan: ActionPlan, initialResume: any, userId: string): Promise<ExecutionSummary> {
    const startTime = Date.now();
    console.log('🎯 Executing action plan:', plan.intent);

    const context: ExecutionContext = {
      resumeData: structuredClone(initialResume),
      userId,
      stepResults: new Map(),
      currentStep: 0,
      totalSteps: plan.steps.length
    };

    const results: ExecutionResult[] = [];
    let successfulSteps = 0;
    let failedSteps = 0;

    try {
      // Execute each reasoning step in sequence
      for (const step of plan.steps) {
        console.log(`🎯 Executing step ${step.step}: ${step.action}`);
        
        const result = await this.executeStep(step, context);
        context.stepResults.set(step.step, result);
        results.push(result);
        
        if (result.success) {
          successfulSteps++;
          console.log(`✅ Step ${step.step} completed: ${result.step.reasoning}`);
        } else {
          failedSteps++;
          console.log(`❌ Step ${step.step} failed: ${result.error}`);
          
          // Decide whether to continue or abort
          if (this.shouldAbortOnFailure(step, result, context)) {
            console.log(`🛑 Aborting execution at step ${step.step}`);
            break;
          }
        }
        
        context.currentStep = step.step;
      }

      const executionTime = Date.now() - startTime;
      const success = failedSteps === 0;

      const summary: ExecutionSummary = {
        success,
        totalSteps: plan.steps.length,
        successfulSteps,
        failedSteps,
        results,
        finalResume: context.resumeData,
        executionTime
      };

      // Store execution history for learning
      this.storeExecutionHistory(userId, plan, summary);

      console.log('🎯 Plan execution completed:', {
        success,
        totalSteps: plan.steps.length,
        successfulSteps,
        failedSteps,
        executionTime: `${executionTime}ms`
      });

      return summary;

    } catch (error) {
      console.error('❌ Plan execution failed:', error);
      
      return {
        success: false,
        totalSteps: plan.steps.length,
        successfulSteps,
        failedSteps: failedSteps + 1,
        results,
        finalResume: context.resumeData,
        executionTime: Date.now() - startTime
      };
    }
  }

  /**
   * 🎯 Execute individual reasoning step using semantic registry
   */
  private async executeStep(step: ReasoningStep, context: ExecutionContext): Promise<ExecutionResult> {
    try {
      console.log(`🎯 执行语义动作: ${step.action}`);
      
      // 使用语义动作注册表执行
      const result = await this.semanticRegistry.executeSemanticAction(
        step.action,
        step,
        context
      );

      return {
        success: true,
        result,
        step
      };

    } catch (error) {
      console.error(`❌ 语义动作执行失败: ${step.action}`, error);
      return {
        success: false,
        result: null,
        step,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // 🧠 所有执行逻辑现在由语义动作注册表处理
  // 不再需要硬编码的switch语句！

  /**
   * 🛑 Decide whether to abort on failure
   */
  private shouldAbortOnFailure(step: ReasoningStep, result: ExecutionResult, context: ExecutionContext): boolean {
    // Critical steps that should abort execution
    const criticalActions = ['identify_section'];
    
    if (criticalActions.includes(step.action)) {
      return true;
    }
    
    // If confidence is too low, abort
    if (step.confidence < 0.3) {
      return true;
    }
    
    // If we're past the halfway point and still failing, abort
    if (context.currentStep > context.totalSteps / 2) {
      return true;
    }
    
    return false;
  }

  /**
   * 📈 Calculate text similarity
   */
  private calculateSimilarity(text1: string, text2: string): number {
    const s1 = text1.toLowerCase().trim();
    const s2 = text2.toLowerCase().trim();
    
    if (s1 === s2) return 1.0;
    if (s1.includes(s2) || s2.includes(s1)) return 0.9;
    
    const words1 = s1.split(/\s+/);
    const words2 = s2.split(/\s+/);
    const common = words1.filter(w => words2.includes(w));
    return common.length / Math.max(words1.length, words2.length);
  }

  /**
   * 💾 Store execution history for learning
   */
  private storeExecutionHistory(userId: string, plan: ActionPlan, summary: ExecutionSummary): void {
    if (!this.executionHistory.has(userId)) {
      this.executionHistory.set(userId, []);
    }
    
    const history = this.executionHistory.get(userId)!;
    history.push({
      timestamp: new Date(),
      plan,
      summary,
      success: summary.success
    });
    
    // Keep only last 100 executions
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }
  }

  /**
   * 📊 Get execution statistics
   */
  getExecutionStats(userId: string): any {
    const history = this.executionHistory.get(userId) || [];
    
    if (history.length === 0) {
      return { total: 0, success: 0, failure: 0, successRate: 0 };
    }
    
    const successful = history.filter(h => h.success).length;
    const total = history.length;
    
    return {
      total,
      success: successful,
      failure: total - successful,
      successRate: successful / total,
      recentExecutions: history.slice(-10)
    };
  }

  /**
   * 🧹 Clear execution history
   */
  clearExecutionHistory(userId?: string): void {
    if (userId) {
      this.executionHistory.delete(userId);
    } else {
      this.executionHistory.clear();
    }
  }
}
