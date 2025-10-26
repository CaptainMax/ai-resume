// src/core/fallbackInterpreter.ts
// 🚑 回退解释器 - 处理未知动作的自我修复机制

import OpenAI from 'openai';
import { semanticActionRegistry, ReasoningStep } from './semanticActionRegistry';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface FallbackSuggestion {
  action: string;
  method: string;
  params: Record<string, any>;
  reasoning: string;
  confidence: number;
}

export class FallbackInterpreter {
  private fallbackHistory: Map<string, any[]> = new Map();

  /**
   * 🚑 处理未知动作
   */
  async handleUnknownAction(unknownAction: string, step: ReasoningStep, resumeData: any): Promise<any> {
    console.log(`🚑 处理未知动作: ${unknownAction}`);
    
    try {
      // 1. 尝试语义匹配
      const semanticMatch = this.trySemanticMatch(unknownAction, step);
      if (semanticMatch) {
        return await this.executeSemanticMatch(semanticMatch, step, resumeData);
      }

      // 2. LLM 回退解释
      const suggestion = await this.generateFallbackSuggestion(unknownAction, step, resumeData);
      return await this.executeFallbackSuggestion(suggestion, step, resumeData);

    } catch (error) {
      console.error(`❌ 回退处理失败: ${unknownAction}`, error);
      return this.createErrorResult(unknownAction, error);
    }
  }

  /**
   * 🔍 尝试语义匹配
   */
  private trySemanticMatch(unknownAction: string, step: ReasoningStep): string | null {
    const availableActions = semanticActionRegistry.listActions();
    const actionLower = unknownAction.toLowerCase();
    
    // 简单的关键词匹配
    for (const action of availableActions) {
      const actionLower = action.toLowerCase();
      
      // 检查是否包含关键词
      if (actionLower.includes('add') && actionLower.includes('description')) {
        return 'add_description_to_existing_company';
      }
      
      if (actionLower.includes('update') && actionLower.includes('existing')) {
        return 'update_existing_work_experience';
      }
      
      if (actionLower.includes('transform') && actionLower.includes('prefix')) {
        return 'transform_content_with_prefix_removal';
      }
    }
    
    return null;
  }

  /**
   * 🎯 执行语义匹配
   */
  private async executeSemanticMatch(matchedAction: string, step: ReasoningStep, resumeData: any): Promise<any> {
    console.log(`🎯 执行语义匹配: ${matchedAction}`);
    
    const handler = semanticActionRegistry.getHandler(matchedAction);
    if (handler) {
      return await handler(step, resumeData);
    }
    
    throw new Error(`语义匹配失败: ${matchedAction}`);
  }

  /**
   * 🧠 生成回退建议
   */
  private async generateFallbackSuggestion(unknownAction: string, step: ReasoningStep, resumeData: any): Promise<FallbackSuggestion> {
    const availableActions = semanticActionRegistry.listActions();
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `你是一个回退动作解释器。当系统遇到未知动作时，你需要提供执行建议。

未知动作: ${unknownAction}
步骤信息: ${JSON.stringify(step, null, 2)}
简历数据: ${JSON.stringify(resumeData, null, 2)}

可用动作: ${availableActions.join(', ')}

请分析用户意图并提供具体的执行建议，包括:
1. 应该执行什么动作
2. 使用什么方法
3. 需要什么参数
4. 执行推理
5. 置信度

返回JSON格式的建议。`
        },
        {
          role: "user",
          content: `解释未知动作: ${unknownAction}`
        }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const suggestion = JSON.parse(completion.choices[0]?.message?.content || '{}');
    
    // 记录回退历史
    this.recordFallback(unknownAction, suggestion);
    
    return suggestion;
  }

  /**
   * 🎯 执行回退建议
   */
  private async executeFallbackSuggestion(suggestion: FallbackSuggestion, step: ReasoningStep, resumeData: any): Promise<any> {
    const { action, method, params } = suggestion;
    
    // 根据建议动态执行
    if (action === 'add_description_to_existing_company') {
      return await this.addDescriptionToExisting(step, resumeData, params);
    }
    
    if (action === 'update_existing_work_experience') {
      return await this.updateExistingWorkExperience(step, resumeData, params);
    }
    
    if (action === 'transform_content_with_prefix_removal') {
      return await this.transformContentWithPrefixRemoval(step, resumeData, params);
    }
    
    // 默认处理
    return {
      success: true,
      action: 'fallback_execution',
      result: suggestion,
      confidence: suggestion.confidence || 0.7
    };
  }

  /**
   * ➕ 为现有公司添加描述
   */
  private async addDescriptionToExisting(step: ReasoningStep, resumeData: any, params: any): Promise<any> {
    const { company, description } = params;
    const sections = resumeData.sections || [];
    let addedCount = 0;
    const addedItems: string[] = [];
    
    sections.forEach((section: any) => {
      if (section.fields) {
        section.fields.forEach((field: any) => {
          if (field.name?.toLowerCase().includes(company?.toLowerCase())) {
            if (!field.points) field.points = [];
            
            field.points.push({
              id: `point-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              content: description
            });
            addedCount++;
            addedItems.push(`Added description to ${field.name}: ${description.substring(0, 50)}...`);
          }
        });
      }
    });
    
    return {
      success: true,
      action: 'add_description_to_existing_company',
      added: addedCount,
      items: addedItems,
      confidence: 0.9
    };
  }

  /**
   * 🔄 更新现有工作经验
   */
  private async updateExistingWorkExperience(step: ReasoningStep, resumeData: any, params: any): Promise<any> {
    const { company, newContent } = params;
    const sections = resumeData.sections || [];
    let updatedCount = 0;
    
    sections.forEach((section: any) => {
      if (section.fields) {
        section.fields.forEach((field: any) => {
          if (field.name?.toLowerCase().includes(company?.toLowerCase())) {
            if (field.points) {
              field.points.forEach((point: any) => {
                point.content = newContent;
                updatedCount++;
              });
            }
          }
        });
      }
    });
    
    return {
      success: true,
      action: 'update_existing_work_experience',
      updated: updatedCount,
      confidence: 0.9
    };
  }

  /**
   * 🔄 删除前缀转换内容
   */
  private async transformContentWithPrefixRemoval(step: ReasoningStep, resumeData: any, params: any): Promise<any> {
    const { prefix } = params;
    const sections = resumeData.sections || [];
    let transformedCount = 0;
    const transformedItems: string[] = [];
    
    sections.forEach((section: any) => {
      if (section.fields) {
        section.fields.forEach((field: any) => {
          if (field.points) {
            field.points.forEach((point: any) => {
              if (point.content) {
                const originalContent = point.content;
                const prefixRegex = new RegExp(`^${prefix}\\s*:\\s*`, 'i');
                
                if (prefixRegex.test(originalContent)) {
                  const newContent = originalContent.replace(prefixRegex, '').trim();
                  point.content = newContent;
                  transformedCount++;
                  transformedItems.push(`${originalContent.substring(0, 30)}... → ${newContent.substring(0, 30)}...`);
                }
              }
            });
          }
        });
      }
    });
    
    return {
      success: true,
      action: 'transform_content_with_prefix_removal',
      transformed: transformedCount,
      items: transformedItems,
      confidence: 0.9
    };
  }

  /**
   * 📊 记录回退历史
   */
  private recordFallback(unknownAction: string, suggestion: FallbackSuggestion): void {
    if (!this.fallbackHistory.has(unknownAction)) {
      this.fallbackHistory.set(unknownAction, []);
    }
    
    const history = this.fallbackHistory.get(unknownAction)!;
    history.push({
      timestamp: new Date(),
      suggestion,
      success: true
    });
    
    // 保持历史记录在合理范围内
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }
  }

  /**
   * ❌ 创建错误结果
   */
  private createErrorResult(unknownAction: string, error: any): any {
    return {
      success: false,
      action: 'fallback_error',
      error: `无法处理未知动作: ${unknownAction}`,
      details: error.message,
      confidence: 0.0
    };
  }

  /**
   * 📊 获取回退统计
   */
  getFallbackStats(): any {
    const stats: any = {};
    
    for (const [action, history] of this.fallbackHistory) {
      stats[action] = {
        totalFallbacks: history.length,
        successRate: history.filter(h => h.success).length / history.length,
        lastUsed: history[history.length - 1]?.timestamp
      };
    }
    
    return stats;
  }

  /**
   * 🧹 清理回退历史
   */
  clearFallbackHistory(): void {
    this.fallbackHistory.clear();
  }
}

// 全局回退解释器实例
export const fallbackInterpreter = new FallbackInterpreter();
