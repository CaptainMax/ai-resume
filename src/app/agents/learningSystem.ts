// ==================== 学习系统 ====================

export interface UserFeedback {
  id: string;
  userId: string;
  originalText: string;
  aiParse: any;
  userCorrections: {
    sectionMoves: SectionMove[];
    fieldRenames: FieldRename[];
    contentEdits: ContentEdit[];
  };
  timestamp: Date;
  accuracy: number; // 用户评分 1-10
}

export interface SectionMove {
  fromSection: string;
  toSection: string;
  content: string;
}

export interface FieldRename {
  oldName: string;
  newName: string;
  section: string;
}

export interface ContentEdit {
  fieldId: string;
  oldContent: string;
  newContent: string;
}

export interface LearningInsights {
  commonMistakes: CommonMistake[];
  userPreferences: UserPreference[];
  parsingPatterns: ParsingPattern[];
}

export interface CommonMistake {
  pattern: string;
  frequency: number;
  correction: string;
}

export interface UserPreference {
  userId: string;
  preferences: {
    sectionNaming: Record<string, string>;
    contentFormatting: Record<string, string>;
  };
}

export interface ParsingPattern {
  textPattern: string;
  correctClassification: string;
  confidence: number;
}

// ==================== 学习系统核心类 ====================

// ==================== 新增接口 ====================

export interface UserProfile {
  userId: string;
  preferences: {
    sectionNaming: Record<string, string>;
    fieldNaming: Record<string, string>;
    contentStyle: 'concise' | 'detailed';
    language: 'en' | 'zh';
  };
  accuracyHistory: number[];
  commonCorrections: string[];
  lastActive: Date;
}

export interface ParsingRule {
  id: string;
  pattern: string;
  correction: string;
  confidence: number;
  frequency: number;
  userSpecific: boolean;
  userId?: string;
}

export interface OptimizationSuggestion {
  type: 'prompt_enhancement' | 'pattern_recognition' | 'user_preference';
  description: string;
  impact: 'high' | 'medium' | 'low';
  implementation: string;
}

export class LearningSystem {
  private feedbackData: UserFeedback[] = [];
  private learningInsights: LearningInsights | null = null;
  private userProfiles: Map<string, UserProfile> = new Map();
  private parsingRules: Map<string, ParsingRule> = new Map();

  constructor() {
    console.log("🧠 LearningSystem initialized.");
    this.initializeDefaultRules();
  }

  /**
   * 初始化默认解析规则
   */
  private initializeDefaultRules(): void {
    // 通用解析规则
    const defaultRules: ParsingRule[] = [
      {
        id: 'company-name-extraction',
        pattern: 'Company Name.*?([A-Z][a-zA-Z\\s&.,-]+)',
        correction: 'Extract company name from first line after "Company Name"',
        confidence: 0.8,
        frequency: 0,
        userSpecific: false
      },
      {
        id: 'date-range-parsing',
        pattern: '(\\w{3}\\.?\\s+\\d{4})\\s*-\\s*(\\w{3}\\.?\\s+\\d{4}|Current|Present)',
        correction: 'Parse date ranges in format "Mar 2022 - Feb 2025"',
        confidence: 0.9,
        frequency: 0,
        userSpecific: false
      },
      {
        id: 'responsibility-bullets',
        pattern: '•\\s*(.+?)(?=\\n|$)',
        correction: 'Extract bullet points as individual responsibilities',
        confidence: 0.85,
        frequency: 0,
        userSpecific: false
      }
    ];

    defaultRules.forEach(rule => {
      this.parsingRules.set(rule.id, rule);
    });

    console.log('🔧 初始化默认解析规则:', defaultRules.length);
  }

  /**
   * 收集用户反馈
   */
  async collectFeedback(
    userId: string,
    originalText: string,
    aiParse: any,
    userCorrections: UserFeedback['userCorrections']
  ): Promise<void> {
    const feedback: UserFeedback = {
      id: this.generateId(),
      userId,
      originalText,
      aiParse,
      userCorrections,
      timestamp: new Date(),
      accuracy: this.calculateAccuracy(aiParse, userCorrections)
    };

    this.feedbackData.push(feedback);
    console.log(`📚 收集到用户反馈: ${userId}, 准确率: ${feedback.accuracy}`);
    
    // 触发学习分析
    await this.analyzeFeedback();
  }

  /**
   * 分析反馈数据
   */
  private async analyzeFeedback(): Promise<void> {
    if (this.feedbackData.length < 5) {
      console.log("📊 反馈数据不足，等待更多数据...");
      return;
    }

    const insights: LearningInsights = {
      commonMistakes: this.identifyCommonMistakes(),
      userPreferences: this.analyzeUserPreferences(),
      parsingPatterns: this.extractParsingPatterns()
    };

    this.learningInsights = insights;
    console.log("🧠 学习分析完成:", insights);
  }

  /**
   * 识别常见错误
   */
  private identifyCommonMistakes(): CommonMistake[] {
    const mistakes: Record<string, { count: number; corrections: string[] }> = {};

    this.feedbackData.forEach(feedback => {
      feedback.userCorrections.sectionMoves.forEach(move => {
        const key = `${move.fromSection} -> ${move.toSection}`;
        if (!mistakes[key]) {
          mistakes[key] = { count: 0, corrections: [] };
        }
        mistakes[key].count++;
        mistakes[key].corrections.push(move.content);
      });
    });

    return Object.entries(mistakes)
      .map(([pattern, data]) => ({
        pattern,
        frequency: data.count,
        correction: data.corrections[0] // 取第一个修正作为示例
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10); // 取前10个最常见错误
  }

  /**
   * 分析用户偏好
   */
  private analyzeUserPreferences(): UserPreference[] {
    const userPreferences: Record<string, UserPreference> = {};

    this.feedbackData.forEach(feedback => {
      if (!userPreferences[feedback.userId]) {
        userPreferences[feedback.userId] = {
          userId: feedback.userId,
          preferences: {
            sectionNaming: {},
            contentFormatting: {}
          }
        };
      }

      // 分析section命名偏好
      feedback.userCorrections.fieldRenames.forEach(rename => {
        userPreferences[feedback.userId].preferences.sectionNaming[rename.oldName] = rename.newName;
      });
    });

    return Object.values(userPreferences);
  }

  /**
   * 提取解析模式
   */
  private extractParsingPatterns(): ParsingPattern[] {
    const patterns: ParsingPattern[] = [];

    this.feedbackData.forEach(feedback => {
      feedback.userCorrections.sectionMoves.forEach(move => {
        patterns.push({
          textPattern: move.content,
          correctClassification: move.toSection,
          confidence: 0.8 // 基于用户修正的置信度
        });
      });
    });

    return patterns;
  }

  /**
   * 应用学习到的优化
   */
  async applyLearning(parseResult: any, userId?: string): Promise<any> {
    // 确保返回的数据格式正确
    if (!parseResult || !Array.isArray(parseResult)) {
      console.log("⚠️ 学习系统：输入数据格式不正确，返回原始数据");
      return parseResult;
    }

    if (!this.learningInsights) {
      console.log("📊 学习系统：暂无学习数据，返回原始解析结果");
      return parseResult;
    }

    console.log("🔧 应用学习优化...");

    // 应用常见错误修正
    const optimizedResult = this.applyCommonMistakeCorrections(parseResult);
    
    // 应用用户偏好
    if (userId) {
      const userPreference = this.learningInsights.userPreferences.find(p => p.userId === userId);
      if (userPreference) {
        return this.applyUserPreferences(optimizedResult, userPreference);
      }
    }

    return optimizedResult;
  }

  /**
   * 应用常见错误修正
   */
  private applyCommonMistakeCorrections(parseResult: any): any {
    // 基于学习到的常见错误模式进行修正
    // 这里可以根据具体的学习结果实现修正逻辑
    return parseResult;
  }

  /**
   * 应用用户偏好
   */
  private applyUserPreferences(parseResult: any, userPreference: UserPreference): any {
    // 根据用户历史偏好调整解析结果
    // 这里可以根据用户偏好实现个性化调整
    return parseResult;
  }

  /**
   * 计算准确率
   */
  private calculateAccuracy(aiParse: any, userCorrections: UserFeedback['userCorrections']): number {
    // 简单的准确率计算：基于修正次数
    const totalCorrections = 
      userCorrections.sectionMoves.length + 
      userCorrections.fieldRenames.length + 
      userCorrections.contentEdits.length;
    
    // 修正越少，准确率越高
    return Math.max(1, 10 - totalCorrections);
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取学习洞察
   */
  getLearningInsights(): LearningInsights | null {
    return this.learningInsights;
  }

  /**
   * 获取反馈数据
   */
  getFeedbackData(): UserFeedback[] {
    return this.feedbackData;
  }

  // ==================== 新增学习方法 ====================

  /**
   * 分析用户反馈模式
   */
  async analyzeUserPatterns(userId: string): Promise<UserProfile> {
    const userFeedback = this.feedbackData.filter(f => f.userId === userId);
    
    if (userFeedback.length === 0) {
      return this.createDefaultUserProfile(userId);
    }

    const profile: UserProfile = {
      userId,
      preferences: {
        sectionNaming: this.analyzeSectionNamingPreferences(userFeedback),
        fieldNaming: this.analyzeFieldNamingPreferences(userFeedback),
        contentStyle: this.analyzeContentStylePreferences(userFeedback),
        language: this.analyzeLanguagePreferences(userFeedback)
      },
      accuracyHistory: userFeedback.map(f => f.accuracy),
      commonCorrections: this.extractCommonCorrections(userFeedback),
      lastActive: new Date()
    };

    this.userProfiles.set(userId, profile);
    console.log('👤 分析用户模式:', userId, profile);
    return profile;
  }

  /**
   * 生成个性化解析规则
   */
  generatePersonalizedRules(userId: string): ParsingRule[] {
    const profile = this.userProfiles.get(userId);
    if (!profile) return [];

    const personalizedRules: ParsingRule[] = [];

    // 基于用户偏好的字段命名规则
    Object.entries(profile.preferences.fieldNaming).forEach(([original, preferred]) => {
      personalizedRules.push({
        id: `user-${userId}-field-${original}`,
        pattern: original,
        correction: `Use "${preferred}" instead of "${original}"`,
        confidence: 0.9,
        frequency: 1,
        userSpecific: true,
        userId
      });
    });

    // 基于用户偏好的内容风格规则
    if (profile.preferences.contentStyle === 'concise') {
      personalizedRules.push({
        id: `user-${userId}-concise-style`,
        pattern: 'detailed.*description',
        correction: 'Prefer concise, bullet-point format',
        confidence: 0.8,
        frequency: 1,
        userSpecific: true,
        userId
      });
    }

    return personalizedRules;
  }

  /**
   * 优化AI提示词
   */
  optimizePrompt(userId: string, basePrompt: string): string {
    const profile = this.userProfiles.get(userId);
    if (!profile) return basePrompt;

    let optimizedPrompt = basePrompt;

    // 添加用户偏好指导
    if (profile.preferences.language === 'zh') {
      optimizedPrompt += '\n\n🎯 用户偏好：\n';
      optimizedPrompt += '- 使用中文输出\n';
    } else {
      optimizedPrompt += '\n\n🎯 User Preferences:\n';
      optimizedPrompt += '- Use English output\n';
    }

    // 添加字段命名偏好
    if (Object.keys(profile.preferences.fieldNaming).length > 0) {
      optimizedPrompt += '- 字段命名偏好：\n';
      Object.entries(profile.preferences.fieldNaming).forEach(([original, preferred]) => {
        optimizedPrompt += `  * "${original}" → "${preferred}"\n`;
      });
    }

    // 添加内容风格偏好
    if (profile.preferences.contentStyle === 'concise') {
      optimizedPrompt += '- 偏好简洁的内容格式\n';
    } else {
      optimizedPrompt += '- 偏好详细的内容描述\n';
    }

    return optimizedPrompt;
  }

  /**
   * 生成优化建议
   */
  generateOptimizationSuggestions(): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // 分析常见错误模式
    const commonMistakes = this.identifyCommonMistakes();
    if (commonMistakes.length > 0) {
      suggestions.push({
        type: 'pattern_recognition',
        description: `发现 ${commonMistakes.length} 个常见解析错误模式`,
        impact: 'high',
        implementation: '增强模式识别规则'
      });
    }

    // 分析用户偏好一致性
    const userPreferences = this.analyzeUserPreferences();
    if (userPreferences.length > 1) {
      suggestions.push({
        type: 'user_preference',
        description: '检测到用户个性化偏好，建议启用个性化解析',
        impact: 'medium',
        implementation: '应用用户特定的解析规则'
      });
    }

    // 分析准确率趋势
    const accuracyTrend = this.analyzeAccuracyTrend();
    if (accuracyTrend < 0.1) {
      suggestions.push({
        type: 'prompt_enhancement',
        description: '准确率提升缓慢，建议优化AI提示词',
        impact: 'high',
        implementation: '基于反馈数据优化系统提示词'
      });
    }

    return suggestions;
  }

  // ==================== 私有辅助方法 ====================

  private createDefaultUserProfile(userId: string): UserProfile {
    return {
      userId,
      preferences: {
        sectionNaming: {},
        fieldNaming: {},
        contentStyle: 'detailed',
        language: 'en'
      },
      accuracyHistory: [],
      commonCorrections: [],
      lastActive: new Date()
    };
  }

  private analyzeSectionNamingPreferences(feedback: UserFeedback[]): Record<string, string> {
    const preferences: Record<string, string> = {};
    // TODO: 实现section命名偏好分析
    return preferences;
  }

  private analyzeFieldNamingPreferences(feedback: UserFeedback[]): Record<string, string> {
    const preferences: Record<string, string> = {};
    // TODO: 实现字段命名偏好分析
    return preferences;
  }

  private analyzeContentStylePreferences(feedback: UserFeedback[]): 'concise' | 'detailed' {
    // TODO: 实现内容风格偏好分析
    return 'detailed';
  }

  private analyzeLanguagePreferences(feedback: UserFeedback[]): 'en' | 'zh' {
    // TODO: 实现语言偏好分析
    return 'en';
  }

  private extractCommonCorrections(feedback: UserFeedback[]): string[] {
    const corrections: string[] = [];
    // TODO: 实现常见修正提取
    return corrections;
  }

  private analyzeAccuracyTrend(): number {
    if (this.feedbackData.length < 2) return 0;
    
    const recent = this.feedbackData.slice(-5);
    const older = this.feedbackData.slice(-10, -5);
    
    if (older.length === 0) return 0;
    
    const recentAvg = recent.reduce((sum, f) => sum + f.accuracy, 0) / recent.length;
    const olderAvg = older.reduce((sum, f) => sum + f.accuracy, 0) / older.length;
    
    return recentAvg - olderAvg;
  }
}
