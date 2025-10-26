// src/core/semanticActionRegistry.ts
// 🧠 核心语义动作注册表 - 真正的推理基础设施

export interface ReasoningStep {
  step: number;
  action: string;
  target: string;
  method: string;
  params: Record<string, any>;
  reasoning: string;
  confidence: number;
}

export type ActionHandler = (step: ReasoningStep, resumeData: any) => Promise<any>;

export interface ActionMetadata {
  name: string;
  description: string;
  semanticKeywords: string[];
  successRate: number;
  usageCount: number;
  lastUsed: Date;
}

class SemanticActionRegistry {
  private handlers: Map<string, ActionHandler> = new Map();
  private metadata: Map<string, ActionMetadata> = new Map();
  private learningHistory: Map<string, any[]> = new Map();

  /**
   * 🎯 动态注册动作处理器
   */
  registerAction(name: string, handler: ActionHandler, metadata?: Partial<ActionMetadata>): void {
    this.handlers.set(name, handler);
    this.metadata.set(name, {
      name,
      description: metadata?.description || '',
      semanticKeywords: metadata?.semanticKeywords || [],
      successRate: 1.0,
      usageCount: 0,
      lastUsed: new Date(),
      ...metadata
    });
    
    console.log(`🎯 注册语义动作: ${name}`);
  }

  /**
   * 🔍 获取动作处理器
   */
  getHandler(actionName: string): ActionHandler | null {
    return this.handlers.get(actionName) || null;
  }

  /**
   * 🎯 执行语义动作
   */
  async executeAction(actionName: string, step: ReasoningStep, resumeData: any): Promise<any> {
    const handler = this.getHandler(actionName);
    
    if (!handler) {
      throw new Error(`Unknown action: ${actionName}`);
    }

    try {
      const startTime = Date.now();
      const result = await handler(step, resumeData);
      const executionTime = Date.now() - startTime;

      // 记录成功执行
      this.recordExecution(actionName, true, executionTime, result);
      
      return result;
    } catch (error) {
      // 记录失败执行
      this.recordExecution(actionName, false, 0, error);
      throw error;
    }
  }

  /**
   * 📊 记录执行历史
   */
  private recordExecution(actionName: string, success: boolean, executionTime: number, result: any): void {
    const metadata = this.metadata.get(actionName);
    if (metadata) {
      metadata.usageCount++;
      metadata.lastUsed = new Date();
      
      // 更新成功率
      const history = this.learningHistory.get(actionName) || [];
      history.push({
        success,
        executionTime,
        timestamp: new Date(),
        result: success ? result : null
      });
      
      // 保持历史记录在合理范围内
      if (history.length > 100) {
        history.splice(0, history.length - 100);
      }
      
      this.learningHistory.set(actionName, history);
      
      // 计算成功率
      const successCount = history.filter(h => h.success).length;
      metadata.successRate = successCount / history.length;
    }
  }

  /**
   * 🧠 语义匹配 - 根据关键词找到最佳动作
   */
  findBestMatch(semanticIntent: string): string | null {
    const intentLower = semanticIntent.toLowerCase();
    let bestMatch: string | null = null;
    let bestScore = 0;

    for (const [actionName, metadata] of this.metadata) {
      for (const keyword of metadata.semanticKeywords) {
        if (intentLower.includes(keyword.toLowerCase())) {
          // 考虑成功率和关键词匹配度
          const score = metadata.successRate * (1 + (keyword.length / 10));
          if (score > bestScore) {
            bestScore = score;
            bestMatch = actionName;
          }
        }
      }
    }

    return bestMatch;
  }

  /**
   * 📈 获取动作统计
   */
  getActionStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    
    for (const [name, metadata] of this.metadata) {
      const history = this.learningHistory.get(name) || [];
      stats[name] = {
        ...metadata,
        totalExecutions: history.length,
        averageExecutionTime: history.reduce((sum, h) => sum + h.executionTime, 0) / history.length || 0,
        recentSuccessRate: history.slice(-10).filter(h => h.success).length / Math.min(10, history.length) || 0
      };
    }
    
    return stats;
  }

  /**
   * 🧹 清理低效动作
   */
  cleanupInefficientActions(threshold: number = 0.3): void {
    for (const [name, metadata] of this.metadata) {
      if (metadata.successRate < threshold && metadata.usageCount > 5) {
        console.log(`🧹 清理低效动作: ${name} (成功率: ${metadata.successRate})`);
        this.handlers.delete(name);
        this.metadata.delete(name);
        this.learningHistory.delete(name);
      }
    }
  }

  /**
   * 🔄 动态更新动作
   */
  updateAction(name: string, newHandler: ActionHandler, newMetadata?: Partial<ActionMetadata>): void {
    if (this.handlers.has(name)) {
      this.handlers.set(name, newHandler);
      
      if (newMetadata) {
        const existing = this.metadata.get(name)!;
        this.metadata.set(name, { ...existing, ...newMetadata });
      }
      
      console.log(`🔄 更新动作: ${name}`);
    }
  }

  /**
   * 📋 列出所有可用动作
   */
  listActions(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * 🧹 清理所有数据
   */
  clear(): void {
    this.handlers.clear();
    this.metadata.clear();
    this.learningHistory.clear();
  }
}

// 全局注册表实例
export const semanticActionRegistry = new SemanticActionRegistry();

// 便捷函数
export function registerAction(name: string, handler: ActionHandler, metadata?: Partial<ActionMetadata>): void {
  semanticActionRegistry.registerAction(name, handler, metadata);
}

export function getActionHandler(name: string): ActionHandler | null {
  return semanticActionRegistry.getHandler(name);
}

export function executeAction(actionName: string, step: ReasoningStep, resumeData: any): Promise<any> {
  return semanticActionRegistry.executeAction(actionName, step, resumeData);
}
