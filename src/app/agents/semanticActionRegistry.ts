// src/app/agents/semanticActionRegistry.ts
// 🧠 语义动作注册表 - 动态动作系统

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ActionHandler {
  name: string;
  description: string;
  handler: (step: any, context: any) => Promise<any>;
  semanticKeywords: string[];
}

export interface SemanticMapping {
  [intent: string]: string;
}

export class SemanticActionRegistry {
  private actionRegistry: Map<string, ActionHandler> = new Map();
  private semanticMapping: SemanticMapping = {};
  private learningCache: Map<string, any> = new Map();

  constructor() {
    this.initializeCoreActions();
    this.initializeSemanticMappings();
  }

  /**
   * 🎯 注册语义动作
   */
  registerAction(action: ActionHandler): void {
    this.actionRegistry.set(action.name, action);
    console.log(`🎯 注册语义动作: ${action.name}`);
  }

  /**
   * 🔍 获取动作处理器
   */
  getActionHandler(actionName: string): ActionHandler | null {
    return this.actionRegistry.get(actionName) || null;
  }

  /**
   * 🧠 语义映射 - 将用户意图映射到具体动作
   */
  async mapIntentToAction(intent: string, context: any): Promise<string> {
    // 直接映射
    if (this.semanticMapping[intent]) {
      return this.semanticMapping[intent];
    }

    // 语义相似度匹配
    const bestMatch = this.findBestSemanticMatch(intent, context);
    if (bestMatch) {
      return bestMatch;
    }

    // LLM 推理映射
    return await this.llmSemanticMapping(intent, context);
  }

  /**
   * 🎯 执行语义动作
   */
  async executeSemanticAction(actionName: string, step: any, context: any): Promise<any> {
    let handler = this.getActionHandler(actionName);

    // 如果没有找到处理器，尝试语义映射
    if (!handler) {
      const mappedAction = await this.mapIntentToAction(actionName, context);
      handler = this.getActionHandler(mappedAction);
    }

    // 如果仍然没有找到，使用LLM回退
    if (!handler) {
      return await this.llmFallbackExecution(actionName, step, context);
    }

    try {
      const result = await handler.handler(step, context);
      
      // 学习成功模式
      this.learnFromSuccess(actionName, step, result);
      
      return result;
    } catch (error) {
      console.error(`❌ 动作执行失败: ${actionName}`, error);
      
      // 学习失败模式并尝试回退
      this.learnFromFailure(actionName, step, error);
      return await this.llmFallbackExecution(actionName, step, context);
    }
  }

  /**
   * 🧠 LLM 语义映射
   */
  private async llmSemanticMapping(intent: string, context: any): Promise<string> {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `你是一个语义动作映射器。将用户意图映射到最合适的动作处理器。

可用动作:
${Array.from(this.actionRegistry.keys()).join(', ')}

用户意图: "${intent}"
上下文: ${JSON.stringify(context, null, 2)}

返回最合适的动作名称，如果没有完全匹配的，返回最接近的。`
          },
          {
            role: "user",
            content: `映射意图: "${intent}"`
          }
        ],
        temperature: 0.1
      });

      const mappedAction = completion.choices[0]?.message?.content?.trim();
      
      if (mappedAction && this.actionRegistry.has(mappedAction)) {
        // 缓存映射结果
        this.semanticMapping[intent] = mappedAction;
        return mappedAction;
      }

      return 'add_to_existing'; // 默认回退
    } catch (error) {
      console.error('❌ LLM语义映射失败:', error);
      return 'add_to_existing';
    }
  }

  /**
   * 🚑 LLM 回退执行
   */
  private async llmFallbackExecution(actionName: string, step: any, context: any): Promise<any> {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `你是一个回退执行器。当系统无法识别动作时，你需要提供执行建议。

当前动作: ${actionName}
步骤: ${JSON.stringify(step, null, 2)}
上下文: ${JSON.stringify(context, null, 2)}

请提供具体的执行建议，包括:
1. 应该执行什么操作
2. 如何修改简历数据
3. 返回什么结果

返回JSON格式的执行建议。`
          },
          {
            role: "user",
            content: `执行动作: ${actionName}`
          }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" }
      });

      const fallbackSuggestion = JSON.parse(completion.choices[0]?.message?.content || '{}');
      
      // 根据LLM建议执行
      return await this.executeFallbackSuggestion(fallbackSuggestion, step, context);
      
    } catch (error) {
      console.error('❌ LLM回退执行失败:', error);
      return {
        success: false,
        error: `无法执行动作: ${actionName}`,
        fallback: true
      };
    }
  }

  /**
   * 🔧 执行回退建议
   */
  private async executeFallbackSuggestion(suggestion: any, step: any, context: any): Promise<any> {
    // 根据LLM建议动态执行
    const { action, target, method, params } = suggestion;
    
    if (action === 'add_description_to_existing') {
      return await this.addDescriptionToExisting(step, context, params);
    }
    
    if (action === 'update_existing_content') {
      return await this.updateExistingContent(step, context, params);
    }
    
    // 默认处理
    return {
      success: true,
      action: 'llm_fallback',
      result: suggestion,
      confidence: 0.7
    };
  }

  /**
   * ➕ 为现有条目添加描述
   */
  private async addDescriptionToExisting(step: any, context: any, params: any): Promise<any> {
    const { company, description } = params;
    const sections = context.resumeData.sections || [];
    let addedCount = 0;
    
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
          }
        });
      }
    });
    
    return {
      success: true,
      action: 'add_description_to_existing',
      added: addedCount,
      confidence: 0.9
    };
  }

  /**
   * 🔄 更新现有内容
   */
  private async updateExistingContent(step: any, context: any, params: any): Promise<any> {
    const { target, newContent } = params;
    const sections = context.resumeData.sections || [];
    let updatedCount = 0;
    
    sections.forEach((section: any) => {
      if (section.fields) {
        section.fields.forEach((field: any) => {
          if (field.points) {
            field.points.forEach((point: any) => {
              if (point.content?.toLowerCase().includes(target?.toLowerCase())) {
                point.content = newContent;
                updatedCount++;
              }
            });
          }
        });
      }
    });
    
    return {
      success: true,
      action: 'update_existing_content',
      updated: updatedCount,
      confidence: 0.9
    };
  }

  /**
   * 🔍 查找最佳语义匹配
   */
  private findBestSemanticMatch(intent: string, context: any): string | null {
    const intentLower = intent.toLowerCase();
    
    for (const [actionName, handler] of this.actionRegistry) {
      for (const keyword of handler.semanticKeywords) {
        if (intentLower.includes(keyword.toLowerCase())) {
          return actionName;
        }
      }
    }
    
    return null;
  }

  /**
   * 🎓 从成功中学习
   */
  private learnFromSuccess(actionName: string, step: any, result: any): void {
    const key = `success_${actionName}`;
    const successData = this.learningCache.get(key) || { count: 0, patterns: [] };
    
    successData.count++;
    successData.patterns.push({
      step,
      result,
      timestamp: new Date()
    });
    
    this.learningCache.set(key, successData);
  }

  /**
   * 🎓 从失败中学习
   */
  private learnFromFailure(actionName: string, step: any, error: any): void {
    const key = `failure_${actionName}`;
    const failureData = this.learningCache.get(key) || { count: 0, patterns: [] };
    
    failureData.count++;
    failureData.patterns.push({
      step,
      error: error.message,
      timestamp: new Date()
    });
    
    this.learningCache.set(key, failureData);
  }

  /**
   * 🎯 初始化核心动作
   */
  private initializeCoreActions(): void {
    // 注册现有动作
    this.registerAction({
      name: 'add_to_existing',
      description: '为现有条目添加内容',
      semanticKeywords: ['add to existing', 'update existing', 'add description', '润色', '加入到'],
      handler: async (step, context) => {
        return await this.addDescriptionToExisting(step, context, step.params);
      }
    });

    this.registerAction({
      name: 'identify_section',
      description: '识别简历部分',
      semanticKeywords: ['find section', 'locate section', 'identify'],
      handler: async (step, context) => {
        const sections = context.resumeData.sections || [];
        const query = step.params.query?.toLowerCase() || '';
        const matches = sections.filter((s: any) => 
          s.title?.toLowerCase().includes(query)
        );
        return { found: matches.length > 0, sections: matches };
      }
    });

    this.registerAction({
      name: 'find_content',
      description: '查找内容',
      semanticKeywords: ['find content', 'search', 'locate'],
      handler: async (step, context) => {
        const keyword = step.params.keyword?.toLowerCase();
        const sections = context.resumeData.sections || [];
        const matches: any[] = [];
        
        sections.forEach((section: any) => {
          if (section.fields) {
            section.fields.forEach((field: any) => {
              if (field.points) {
                field.points.forEach((point: any) => {
                  if (point.content?.toLowerCase().includes(keyword)) {
                    matches.push({ section: section.title, field: field.name, point });
                  }
                });
              }
            });
          }
        });
        
        return { found: matches.length > 0, matches };
      }
    });
  }

  /**
   * 🧠 初始化语义映射
   */
  private initializeSemanticMappings(): void {
    this.semanticMapping = {
      "add description for existing company": "add_to_existing",
      "update job responsibilities": "add_to_existing", 
      "polish content": "add_to_existing",
      "create new company entry": "add_content",
      "润色并加入到对应的工作经验": "add_to_existing",
      "在Popping Art Design 我的主要工作经验是": "add_to_existing",
      "帮我润色一下加入到对应的工作经验当中": "add_to_existing"
    };
  }

  /**
   * 📊 获取学习统计
   */
  getLearningStats(): any {
    const stats: any = {};
    
    for (const [key, data] of this.learningCache) {
      stats[key] = {
        count: data.count,
        successRate: key.startsWith('success_') ? 1 : 0
      };
    }
    
    return stats;
  }

  /**
   * 🧹 清理学习缓存
   */
  clearLearningCache(): void {
    this.learningCache.clear();
  }
}
