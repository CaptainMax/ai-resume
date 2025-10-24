// src/app/reasoning/contextMemory.ts
// 🧠 上下文记忆管理 - 维护用户/会话记忆

export interface UserProfile {
  userId: string;
  preferences: {
    language: 'en' | 'zh' | 'auto';
    resumeStyle: 'professional' | 'creative' | 'academic' | 'technical';
    detailLevel: 'brief' | 'detailed' | 'comprehensive';
    feedbackStyle: 'direct' | 'suggestive' | 'encouraging';
  };
  history: {
    successfulOperations: string[];
    failedOperations: string[];
    commonPatterns: Record<string, number>;
  };
  learning: {
    adaptationLevel: number; // 0-1, 用户对AI建议的接受度
    improvementAreas: string[];
    strengths: string[];
  };
}

export interface SessionContext {
  sessionId: string;
  userId: string;
  startTime: Date;
  currentTask: string | null;
  conversationHistory: ConversationEntry[];
  currentResume: {
    id: string;
    sections: any[];
    lastModified: Date;
  } | null;
  userIntent: any | null;
  executionPlan: any | null;
}

export interface ConversationEntry {
  timestamp: Date;
  role: 'user' | 'assistant';
  content: string;
  intent?: any;
  action?: string;
  result?: any;
  feedback?: 'positive' | 'negative' | 'neutral';
}

export interface MemoryContext {
  shortTerm: {
    currentSession: SessionContext | null;
    recentInteractions: ConversationEntry[];
    activeTasks: string[];
  };
  longTerm: {
    userProfiles: Map<string, UserProfile>;
    globalPatterns: Record<string, any>;
    systemInsights: Record<string, any>;
  };
}

export class ContextMemory {
  private memory: MemoryContext;
  private maxShortTermEntries: number = 50;
  private maxLongTermSessions: number = 1000;

  constructor() {
    this.memory = {
      shortTerm: {
        currentSession: null,
        recentInteractions: [],
        activeTasks: []
      },
      longTerm: {
        userProfiles: new Map(),
        globalPatterns: {},
        systemInsights: {}
      }
    };
  }

  /**
   * 初始化用户会话
   * @param userId 用户ID
   * @param sessionId 会话ID
   * @returns 会话上下文
   */
  async initializeSession(userId: string, sessionId: string): Promise<SessionContext> {
    console.log('🔄 初始化用户会话:', { userId, sessionId });
    
    // 获取或创建用户档案
    let userProfile = this.memory.longTerm.userProfiles.get(userId);
    if (!userProfile) {
      userProfile = this.createDefaultUserProfile(userId);
      this.memory.longTerm.userProfiles.set(userId, userProfile);
    }

    // 创建会话上下文
    const sessionContext: SessionContext = {
      sessionId,
      userId,
      startTime: new Date(),
      currentTask: null,
      conversationHistory: [],
      currentResume: null,
      userIntent: null,
      executionPlan: null
    };

    this.memory.shortTerm.currentSession = sessionContext;
    return sessionContext;
  }

  /**
   * 记录对话交互
   * @param entry 对话条目
   */
  async recordInteraction(entry: ConversationEntry): Promise<void> {
    console.log('📝 记录对话交互:', entry);
    
    if (this.memory.shortTerm.currentSession) {
      this.memory.shortTerm.currentSession.conversationHistory.push(entry);
    }
    
    this.memory.shortTerm.recentInteractions.push(entry);
    
    // 维护短期记忆大小
    if (this.memory.shortTerm.recentInteractions.length > this.maxShortTermEntries) {
      this.memory.shortTerm.recentInteractions.shift();
    }
  }

  /**
   * 更新用户意图
   * @param intent 用户意图
   */
  async updateUserIntent(intent: any): Promise<void> {
    console.log('🎯 更新用户意图:', intent);
    
    if (this.memory.shortTerm.currentSession) {
      this.memory.shortTerm.currentSession.userIntent = intent;
    }
  }

  /**
   * 更新执行计划
   * @param plan 执行计划
   */
  async updateExecutionPlan(plan: any): Promise<void> {
    console.log('📋 更新执行计划:', plan);
    
    if (this.memory.shortTerm.currentSession) {
      this.memory.shortTerm.currentSession.executionPlan = plan;
    }
  }

  /**
   * 更新当前简历
   * @param resume 简历数据
   */
  async updateCurrentResume(resume: any): Promise<void> {
    console.log('📄 更新当前简历:', resume);
    
    if (this.memory.shortTerm.currentSession) {
      this.memory.shortTerm.currentSession.currentResume = {
        id: resume.id || `resume_${Date.now()}`,
        sections: resume.sections || [],
        lastModified: new Date()
      };
    }
  }

  /**
   * 获取用户偏好
   * @param userId 用户ID
   * @returns 用户偏好
   */
  async getUserPreferences(userId: string): Promise<UserProfile['preferences']> {
    const userProfile = this.memory.longTerm.userProfiles.get(userId);
    return userProfile?.preferences || this.getDefaultPreferences();
  }

  /**
   * 更新用户偏好
   * @param userId 用户ID
   * @param preferences 新的偏好设置
   */
  async updateUserPreferences(userId: string, preferences: Partial<UserProfile['preferences']>): Promise<void> {
    console.log('⚙️ 更新用户偏好:', { userId, preferences });
    
    let userProfile = this.memory.longTerm.userProfiles.get(userId);
    if (!userProfile) {
      userProfile = this.createDefaultUserProfile(userId);
    }
    
    userProfile.preferences = { ...userProfile.preferences, ...preferences };
    this.memory.longTerm.userProfiles.set(userId, userProfile);
  }

  /**
   * 记录操作结果
   * @param userId 用户ID
   * @param operation 操作类型
   * @param success 是否成功
   * @param feedback 用户反馈
   */
  async recordOperationResult(
    userId: string, 
    operation: string, 
    success: boolean, 
    feedback?: 'positive' | 'negative' | 'neutral'
  ): Promise<void> {
    console.log('📊 记录操作结果:', { userId, operation, success, feedback });
    
    const userProfile = this.memory.longTerm.userProfiles.get(userId);
    if (!userProfile) return;
    
    if (success) {
      userProfile.history.successfulOperations.push(operation);
    } else {
      userProfile.history.failedOperations.push(operation);
    }
    
    // 更新模式统计
    const patternKey = `${operation}_${success ? 'success' : 'failure'}`;
    userProfile.history.commonPatterns[patternKey] = 
      (userProfile.history.commonPatterns[patternKey] || 0) + 1;
    
    // 更新学习数据
    if (feedback) {
      this.updateLearningData(userProfile, operation, feedback);
    }
  }

  /**
   * 获取会话上下文
   * @returns 当前会话上下文
   */
  getCurrentSession(): SessionContext | null {
    return this.memory.shortTerm.currentSession;
  }

  /**
   * 获取对话历史
   * @param limit 限制条数
   * @returns 对话历史
   */
  getConversationHistory(limit: number = 10): ConversationEntry[] {
    const session = this.memory.shortTerm.currentSession;
    if (!session) return [];
    
    return session.conversationHistory.slice(-limit);
  }

  /**
   * 获取用户档案
   * @param userId 用户ID
   * @returns 用户档案
   */
  getUserProfile(userId: string): UserProfile | null {
    return this.memory.longTerm.userProfiles.get(userId) || null;
  }

  /**
   * 分析用户模式
   * @param userId 用户ID
   * @returns 用户行为模式分析
   */
  async analyzeUserPatterns(userId: string): Promise<any> {
    console.log('🔍 分析用户模式:', userId);
    
    const userProfile = this.memory.longTerm.userProfiles.get(userId);
    if (!userProfile) return null;
    
    const patterns = {
      mostUsedOperations: this.getMostUsedOperations(userProfile),
      successRate: this.calculateSuccessRate(userProfile),
      preferredLanguage: userProfile.preferences.language,
      commonIssues: this.getCommonIssues(userProfile),
      improvementSuggestions: this.generateImprovementSuggestions(userProfile)
    };
    
    return patterns;
  }

  /**
   * 清理过期数据
   */
  async cleanupExpiredData(): Promise<void> {
    console.log('🧹 清理过期数据');
    
    // 清理过期的短期记忆
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24小时前
    this.memory.shortTerm.recentInteractions = 
      this.memory.shortTerm.recentInteractions.filter(
        entry => entry.timestamp > cutoffTime
      );
    
    // 清理过期的用户档案（长期不活跃的用户）
    // TODO: 实现更复杂的清理逻辑
  }

  // 私有辅助方法

  private createDefaultUserProfile(userId: string): UserProfile {
    return {
      userId,
      preferences: this.getDefaultPreferences(),
      history: {
        successfulOperations: [],
        failedOperations: [],
        commonPatterns: {}
      },
      learning: {
        adaptationLevel: 0.5,
        improvementAreas: [],
        strengths: []
      }
    };
  }

  private getDefaultPreferences(): UserProfile['preferences'] {
    return {
      language: 'auto',
      resumeStyle: 'professional',
      detailLevel: 'detailed',
      feedbackStyle: 'suggestive'
    };
  }

  private updateLearningData(
    userProfile: UserProfile, 
    operation: string, 
    feedback: 'positive' | 'negative' | 'neutral'
  ): void {
    // TODO: 实现学习数据更新逻辑
    // 根据用户反馈调整适应度、改进领域等
  }

  private getMostUsedOperations(userProfile: UserProfile): string[] {
    const patterns = userProfile.history.commonPatterns;
    return Object.entries(patterns)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([operation]) => operation);
  }

  private calculateSuccessRate(userProfile: UserProfile): number {
    const total = userProfile.history.successfulOperations.length + 
                  userProfile.history.failedOperations.length;
    if (total === 0) return 0;
    return userProfile.history.successfulOperations.length / total;
  }

  private getCommonIssues(userProfile: UserProfile): string[] {
    // TODO: 实现常见问题分析
    return [];
  }

  private generateImprovementSuggestions(userProfile: UserProfile): string[] {
    // TODO: 实现改进建议生成
    return [];
  }
}
