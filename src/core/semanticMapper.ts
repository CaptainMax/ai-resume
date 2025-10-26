// src/core/semanticMapper.ts
// 🧠 语义映射器 - 将语义意图映射到可执行动作

import OpenAI from 'openai';
import { semanticActionRegistry } from './semanticActionRegistry';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface SemanticMapping {
  [semanticIntent: string]: string;
}

export class SemanticMapper {
  private mappings: SemanticMapping = {};
  private learningCache: Map<string, any> = new Map();

  constructor() {
    this.initializeCoreMappings();
  }

  /**
   * 🧠 将语义意图映射到可执行动作
   */
  mapSemanticAction(semanticIntent: string, context?: any): string {
    // 1. 直接映射
    if (this.mappings[semanticIntent]) {
      return this.mappings[semanticIntent];
    }

    // 2. 语义匹配
    const bestMatch = semanticActionRegistry.findBestMatch(semanticIntent);
    if (bestMatch) {
      // 缓存映射结果
      this.mappings[semanticIntent] = bestMatch;
      return bestMatch;
    }

    // 3. LLM 推理映射
    return this.llmSemanticMapping(semanticIntent, context);
  }

  /**
   * 🧠 LLM 语义映射
   */
  private async llmSemanticMapping(semanticIntent: string, context?: any): Promise<string> {
    try {
      const availableActions = semanticActionRegistry.listActions();
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `你是一个语义动作映射器。将语义意图映射到最合适的可执行动作。

可用动作: ${availableActions.join(', ')}

语义意图: "${semanticIntent}"
上下文: ${context ? JSON.stringify(context, null, 2) : '无'}

返回最合适的动作名称。如果没有完全匹配的，返回最接近的。`
          },
          {
            role: "user",
            content: `映射语义意图: "${semanticIntent}"`
          }
        ],
        temperature: 0.1
      });

      const mappedAction = completion.choices[0]?.message?.content?.trim();
      
      if (mappedAction && semanticActionRegistry.getHandler(mappedAction)) {
        // 缓存映射结果
        this.mappings[semanticIntent] = mappedAction;
        return mappedAction;
      }

      // 回退到默认动作
      return 'update_content';
    } catch (error) {
      console.error('❌ LLM语义映射失败:', error);
      return 'update_content';
    }
  }

  /**
   * 🎯 添加自定义映射
   */
  addMapping(semanticIntent: string, actionName: string): void {
    this.mappings[semanticIntent] = actionName;
    console.log(`🎯 添加语义映射: ${semanticIntent} → ${actionName}`);
  }

  /**
   * 🔄 批量添加映射
   */
  addMappings(mappings: SemanticMapping): void {
    Object.assign(this.mappings, mappings);
    console.log(`🔄 批量添加映射: ${Object.keys(mappings).length} 个`);
  }

  /**
   * 📊 获取映射统计
   */
  getMappingStats(): any {
    return {
      totalMappings: Object.keys(this.mappings).length,
      mappings: this.mappings,
      learningCacheSize: this.learningCache.size
    };
  }

  /**
   * 🧹 清理映射
   */
  clearMappings(): void {
    this.mappings = {};
    this.learningCache.clear();
  }

  /**
   * 🎯 初始化核心映射
   */
  private initializeCoreMappings(): void {
    this.mappings = {
      // 中文映射
      "在Popping Art Design 我的主要工作经验是": "add_description_to_existing_company",
      "帮我润色一下加入到对应的工作经验当中": "add_description_to_existing_company",
      "润色并加入到对应的工作经验": "add_description_to_existing_company",
      "在[公司名] 我的主要工作经验是": "add_description_to_existing_company",
      
      // 英文映射
      "add description for existing company": "add_description_to_existing_company",
      "add company brief description": "add_description_to_existing_company",
      "update existing work experience": "update_existing_work_experience",
      "polish and add to existing entry": "polish_and_add_to_existing_entry",
      "create new company entry": "create_new_company_entry",
      "find and update existing content": "find_and_update_existing_content",
      "remove prefix from content": "transform_content_with_prefix_removal",
      
      // 语义动作映射
      "add_description_to_existing_company": "add_description_to_existing_company",
      "update_existing_work_experience": "update_existing_work_experience",
      "polish_and_add_to_existing_entry": "polish_and_add_to_existing_entry",
      "create_new_company_entry": "create_new_company_entry",
      "find_and_update_existing_content": "find_and_update_existing_content",
      "transform_content_with_prefix_removal": "transform_content_with_prefix_removal"
    };
  }
}

// 全局映射器实例
export const semanticMapper = new SemanticMapper();

// 便捷函数
export function mapSemanticAction(semanticIntent: string, context?: any): string {
  return semanticMapper.mapSemanticAction(semanticIntent, context);
}
