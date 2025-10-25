// src/app/agents/llmReasoningEngine.ts
// 🧠 基于 LLM Function Calling 的智能推理引擎

import OpenAI from 'openai';

// 配置 OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🎯 定义 Function Calling Schema
const REASONING_FUNCTIONS = [
  {
    name: "analyze_user_intent",
    description: "分析用户意图并生成结构化操作指令",
    parameters: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["add", "edit", "delete", "move", "optimize", "replace"],
          description: "操作类型"
        },
        target: {
          type: "string", 
          enum: ["section", "field", "point", "content"],
          description: "操作目标"
        },
        entity: {
          type: "string",
          enum: ["education", "experience", "skill", "project", "achievement", "existing"],
          description: "实体类型"
        },
        data: {
          type: "object",
          description: "操作数据",
          properties: {
            section: { type: "string", description: "目标section" },
            fieldId: { type: "string", description: "目标field ID" },
            pointId: { type: "string", description: "目标point ID" },
            content: { type: "string", description: "内容" },
            // 教育相关
            institution: { type: "string", description: "学校名称" },
            degree: { type: "string", description: "学位" },
            major: { type: "string", description: "专业" },
            time: { type: "string", description: "时间" },
            location: { type: "string", description: "地点" },
            // 工作相关
            company: { type: "string", description: "公司名称" },
            position: { type: "string", description: "职位" },
            duration: { type: "string", description: "工作期间" },
            // 技能相关
            skills: { 
              type: "array", 
              items: { type: "string" },
              description: "技能列表"
            }
          }
        },
        confidence: {
          type: "number",
          minimum: 0,
          maximum: 1,
          description: "置信度"
        },
        reasoning: {
          type: "string",
          description: "推理过程说明"
        }
      },
      required: ["action", "target", "entity", "data", "confidence"]
    }
  }
];

export interface LLMReasoningResult {
  intent: string;
  entities: Record<string, any>;
  action: 'add' | 'edit' | 'delete' | 'move' | 'optimize' | 'replace';
  target: 'section' | 'field' | 'point' | 'content';
  entity: string;
  data: Record<string, any>;
  confidence: number;
  reasoning: string;
  reasoningSteps: string[];
}

export class LLMReasoningEngine {
  private contextMemory: Map<string, any> = new Map();
  private userHistory: Map<string, any[]> = new Map();
  private feedbackData: Map<string, any[]> = new Map();
  private learningPatterns: Map<string, any> = new Map();
  private userPreferences: Map<string, any> = new Map();

  constructor() {
    console.log("🧠 LLM ReasoningEngine initialized with Function Calling");
    this.initializeLearningSystem();
  }

  /**
   * 🎓 初始化学习系统
   */
  private initializeLearningSystem(): void {
    this.learningPatterns.set('intent_accuracy', new Map());
    this.learningPatterns.set('extraction_accuracy', new Map());
    this.learningPatterns.set('user_preferences', new Map());
    console.log("🎓 学习系统已初始化");
  }

  /**
   * 🎯 核心方法：使用 LLM Function Calling 分析用户意图
   */
  async analyzeUserIntent(
    userInput: string,
    currentResume: any,
    userId: string = 'default'
  ): Promise<LLMReasoningResult> {
    console.log("🧠 LLM分析用户输入:", userInput);

    try {
      // 构建上下文
      const context = this.buildContext(currentResume, userId);
      
      // 调用 OpenAI Function Calling
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `你是一个智能简历编辑助手。分析用户的自然语言输入，理解其意图，并生成相应的结构化操作指令。

当前简历结构：
${JSON.stringify(context, null, 2)}

重要提示：
- 如果用户说"delete this part"、"删除这个"、"remove this"等，且当前有选中的元素，应该删除选中的具体元素
- 如果用户说"delete this point"、"删除这个point"，应该删除选中的point
- 如果用户说"delete this field"、"删除这个field"，应该删除选中的field
- 如果用户说"delete this section"、"删除这个section"，应该删除选中的section
- 优先考虑用户选中的具体元素，而不是整个section

关键：当有selectedPoint时，必须使用selectedPoint中的sectionId、fieldId、pointId，不要自己生成ID！

请仔细分析用户输入，理解其真实意图，并生成准确的操作指令。`
          },
          {
            role: "user", 
            content: userInput
          }
        ],
        functions: REASONING_FUNCTIONS,
        function_call: { name: "analyze_user_intent" },
        temperature: 0.1, // 低温度确保输出稳定
        max_tokens: 1000
      });

      // 解析 Function Calling 结果
      const functionCall = response.choices[0]?.message?.function_call;
      
      if (!functionCall || functionCall.name !== "analyze_user_intent") {
        throw new Error("LLM未返回有效的function call");
      }

      const result = JSON.parse(functionCall.arguments) as LLMReasoningResult;
      
      // 应用学习结果
      const learnedResult = this.applyLearningToAnalysis(userId, result);
      
      // 记录用户操作历史
      this.recordUserAction(userId, {
        input: userInput,
        result: learnedResult,
        timestamp: new Date()
      });

      console.log("✅ LLM推理完成:", learnedResult);
      return learnedResult;

    } catch (error) {
      console.error("❌ LLM推理失败:", error);
      
      // 返回默认结果
      return {
        intent: 'add_education',
        entities: { section: 'Education' },
        action: 'add',
        target: 'field',
        entity: 'education',
        data: { section: 'Education' },
        confidence: 0.3,
        reasoning: 'LLM推理失败，使用默认添加教育意图',
        reasoningSteps: ['LLM推理失败', '使用默认添加教育意图']
      };
    }
  }

  /**
   * 🏗️ 构建上下文信息
   */
  private buildContext(currentResume: any, userId: string): any {
    const context = {
      sections: currentResume?.sections || [],
      selectedPoint: currentResume?.selectedPoint || null,
      selectedField: currentResume?.selectedField || null,
      selectedSection: currentResume?.selectedSection || null,
      userHistory: this.userHistory.get(userId) || [],
      timestamp: new Date().toISOString()
    };

    return context;
  }

  /**
   * 📝 记录用户操作历史
   */
  private recordUserAction(userId: string, action: any): void {
    if (!this.userHistory.has(userId)) {
      this.userHistory.set(userId, []);
    }
    
    const history = this.userHistory.get(userId)!;
    history.push(action);
    
    // 保持历史记录在合理范围内
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }
  }

  /**
   * 🎓 获取用户历史
   */
  getUserHistory(userId: string): any[] {
    return this.userHistory.get(userId) || [];
  }

  /**
   * 📝 收集用户反馈
   */
  collectFeedback(userId: string, feedback: {
    reasoning: LLMReasoningResult;
    userCorrection?: any;
    satisfaction?: number;
    accuracy?: number;
    success?: boolean;
  }): void {
    if (!this.feedbackData.has(userId)) {
      this.feedbackData.set(userId, []);
    }
    
    const feedbacks = this.feedbackData.get(userId)!;
    feedbacks.push({
      timestamp: new Date(),
      feedback,
      learningApplied: false
    });
    
    // 应用学习
    this.applyLearningFromFeedback(userId, feedback);
    
    console.log("📝 反馈已收集:", feedback);
  }

  /**
   * 🎓 从反馈中学习
   */
  private applyLearningFromFeedback(userId: string, feedback: any): void {
    const { reasoning, userCorrection, satisfaction, accuracy, success } = feedback;
    
    // 学习意图识别准确性
    if (satisfaction !== undefined) {
      this.updateIntentAccuracy(userId, reasoning.action, satisfaction);
    }
    
    // 学习信息提取准确性
    if (accuracy !== undefined) {
      this.updateExtractionAccuracy(userId, reasoning.entity, accuracy);
    }
    
    // 学习用户偏好
    if (userCorrection) {
      this.updateUserPreferences(userId, userCorrection);
    }
    
    // 学习成功/失败模式
    if (success !== undefined) {
      this.updateSuccessPatterns(userId, reasoning.action, success);
    }
    
    console.log("🎓 学习已应用");
  }

  /**
   * 📊 更新意图识别准确性
   */
  private updateIntentAccuracy(userId: string, action: string, satisfaction: number): void {
    const intentAccuracy = this.learningPatterns.get('intent_accuracy')!;
    const key = `${userId}_${action}`;
    
    if (!intentAccuracy.has(key)) {
      intentAccuracy.set(key, { count: 0, totalSatisfaction: 0, averageSatisfaction: 0 });
    }
    
    const data = intentAccuracy.get(key);
    data.count += 1;
    data.totalSatisfaction += satisfaction;
    data.averageSatisfaction = data.totalSatisfaction / data.count;
    
    intentAccuracy.set(key, data);
  }

  /**
   * 📊 更新信息提取准确性
   */
  private updateExtractionAccuracy(userId: string, entity: string, accuracy: number): void {
    const extractionAccuracy = this.learningPatterns.get('extraction_accuracy')!;
    const key = `${userId}_${entity}`;
    
    if (!extractionAccuracy.has(key)) {
      extractionAccuracy.set(key, { count: 0, totalAccuracy: 0, averageAccuracy: 0 });
    }
    
    const data = extractionAccuracy.get(key);
    data.count += 1;
    data.totalAccuracy += accuracy;
    data.averageAccuracy = data.totalAccuracy / data.count;
    
    extractionAccuracy.set(key, data);
  }

  /**
   * 🎯 更新用户偏好
   */
  private updateUserPreferences(userId: string, correction: any): void {
    if (!this.userPreferences.has(userId)) {
      this.userPreferences.set(userId, {
        preferredActions: new Map(),
        preferredFormats: new Map(),
        commonCorrections: []
      });
    }
    
    const preferences = this.userPreferences.get(userId);
    preferences.commonCorrections.push({
      timestamp: new Date(),
      correction
    });
    
    // 保持修正记录在合理范围内
    if (preferences.commonCorrections.length > 50) {
      preferences.commonCorrections.splice(0, preferences.commonCorrections.length - 50);
    }
  }

  /**
   * 🎯 更新成功模式
   */
  private updateSuccessPatterns(userId: string, action: string, success: boolean): void {
    const successPatterns = this.learningPatterns.get('success_patterns') || new Map();
    const key = `${userId}_${action}`;
    
    if (!successPatterns.has(key)) {
      successPatterns.set(key, { total: 0, successful: 0, successRate: 0 });
    }
    
    const data = successPatterns.get(key);
    data.total += 1;
    if (success) data.successful += 1;
    data.successRate = data.successful / data.total;
    
    successPatterns.set(key, data);
    this.learningPatterns.set('success_patterns', successPatterns);
  }

  /**
   * 🧠 应用学习结果到新的分析
   */
  applyLearningToAnalysis(userId: string, reasoning: LLMReasoningResult): LLMReasoningResult {
    // 获取用户学习数据
    const intentAccuracy = this.learningPatterns.get('intent_accuracy')!;
    const extractionAccuracy = this.learningPatterns.get('extraction_accuracy')!;
    const userPreferences = this.userPreferences.get(userId);
    
    // 调整置信度基于历史准确性
    const intentKey = `${userId}_${reasoning.action}`;
    if (intentAccuracy.has(intentKey)) {
      const intentData = intentAccuracy.get(intentKey);
      if (intentData.averageSatisfaction > 0.7) {
        reasoning.confidence = Math.min(0.95, reasoning.confidence + 0.1);
      } else if (intentData.averageSatisfaction < 0.5) {
        reasoning.confidence = Math.max(0.1, reasoning.confidence - 0.1);
      }
    }
    
    // 应用用户偏好
    if (userPreferences) {
      this.adjustReasoningBasedOnPreferences(reasoning, userPreferences);
    }
    
    console.log("🎯 学习结果已应用到分析中");
    return reasoning;
  }

  /**
   * 🎯 根据用户偏好调整推理
   */
  private adjustReasoningBasedOnPreferences(reasoning: LLMReasoningResult, preferences: any): void {
    // 基于用户历史修正调整推理
    if (preferences.commonCorrections.length > 0) {
      const recentCorrections = preferences.commonCorrections.slice(-5);
      const correctionPatterns = this.analyzeCorrectionPatterns(recentCorrections);
      
      // 根据修正模式调整推理
      this.optimizeReasoningBasedOnCorrections(reasoning, correctionPatterns);
    }
  }

  /**
   * 📊 分析修正模式
   */
  private analyzeCorrectionPatterns(corrections: any[]): any {
    const patterns = {
      commonIssues: new Map(),
      preferredFormats: new Map(),
      frequentChanges: new Map()
    };
    
    corrections.forEach(correction => {
      // 分析常见问题
      if (correction.correction.type === 'format') {
        const count = patterns.commonIssues.get('format') || 0;
        patterns.commonIssues.set('format', count + 1);
      }
      
      // 分析偏好格式
      if (correction.correction.preferredFormat) {
        const format = correction.correction.preferredFormat;
        const count = patterns.preferredFormats.get(format) || 0;
        patterns.preferredFormats.set(format, count + 1);
      }
    });
    
    return patterns;
  }

  /**
   * 🎯 基于修正优化推理
   */
  private optimizeReasoningBasedOnCorrections(reasoning: LLMReasoningResult, patterns: any): void {
    // 根据修正模式优化推理
    if (patterns.commonIssues.get('format') > 2) {
      reasoning.reasoning += " (注意格式规范)";
    }
    
    if (patterns.preferredFormats.size > 0) {
      // 简化处理，直接添加格式建议
      reasoning.reasoning += " (使用偏好格式)";
    }
  }

  /**
   * 📊 获取学习数据
   */
  getLearningData(userId: string): any {
    return {
      intentAccuracy: this.getIntentAccuracy(userId),
      extractionAccuracy: this.getExtractionAccuracy(userId),
      userPreferences: this.userPreferences.get(userId),
      feedbackHistory: this.feedbackData.get(userId) || []
    };
  }

  /**
   * 📊 获取意图识别准确性
   */
  private getIntentAccuracy(userId: string): any {
    const intentAccuracy = this.learningPatterns.get('intent_accuracy')!;
    const userData = new Map();
    
    for (const [key, value] of intentAccuracy.entries()) {
      if (key.startsWith(`${userId}_`)) {
        const action = key.replace(`${userId}_`, '');
        userData.set(action, value);
      }
    }
    
    return Object.fromEntries(userData);
  }

  /**
   * 📊 获取信息提取准确性
   */
  private getExtractionAccuracy(userId: string): any {
    const extractionAccuracy = this.learningPatterns.get('extraction_accuracy')!;
    const userData = new Map();
    
    for (const [key, value] of extractionAccuracy.entries()) {
      if (key.startsWith(`${userId}_`)) {
        const entity = key.replace(`${userId}_`, '');
        userData.set(entity, value);
      }
    }
    
    return Object.fromEntries(userData);
  }

  /**
   * 🧹 清理上下文
   */
  clearContext(userId?: string): void {
    if (userId) {
      this.userHistory.delete(userId);
      this.contextMemory.delete(userId);
      this.feedbackData.delete(userId);
      this.userPreferences.delete(userId);
    } else {
      this.userHistory.clear();
      this.contextMemory.clear();
      this.feedbackData.clear();
      this.userPreferences.clear();
    }
    console.log("🧹 上下文已清理");
  }

  /**
   * 🧠 统一意图分析 - 系统唯一的推理源头
   */
  async analyzeIntent(userInput: string, context: any): Promise<any> {
    console.log('🧠 开始统一意图分析:', userInput);
    
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `你是一个智能简历助手，专门分析用户意图并提取结构化信息。

你的任务是：
1. 分析用户意图（intent）
2. 提取相关实体（entities）
3. 评估置信度（confidence）
4. 提供推理步骤（reasoningSteps）

可能的意图类型：
- add_education: 添加教育经历
- add_work_experience: 添加工作经验
- add_skill: 添加技能
- add_summary: 添加简历摘要/简介
- delete_item: 删除项目
- edit_item: 编辑项目
- optimize_content: 优化内容

返回JSON格式：
{
  "intent": "意图类型",
  "entities": {
    "相关实体字段": "值"
  },
  "confidence": 0.0-1.0,
  "reasoningSteps": ["推理步骤1", "推理步骤2"]
}`
          },
          {
            role: "user",
            content: `用户输入: "${userInput}"
当前上下文: ${JSON.stringify(context, null, 2)}`
          }
        ],
        temperature: 0.1,
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('AI没有返回有效响应');
      }

      const reasoning = JSON.parse(response);
      console.log('🧠 意图分析结果:', reasoning);
      
      return {
        success: true,
        intent: reasoning.intent,
        entities: reasoning.entities || {},
        confidence: reasoning.confidence || 0.5,
        reasoningSteps: reasoning.reasoningSteps || []
      };

    } catch (error) {
      console.error('❌ 意图分析失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '意图分析失败'
      };
    }
  }
}
