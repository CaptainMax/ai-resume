// src/app/agents/confidenceEvolution.ts
// 🎯 置信度进化系统 - 根据学习效果动态调整解析置信度

export interface ConfidenceMetrics {
  baseConfidence: number;
  userAccuracy: number;
  feedbackQuality: number;
  patternMatch: number;
  historicalPerformance: number;
  finalConfidence: number;
}

export interface EvolutionRule {
  id: string;
  condition: string;
  adjustment: number;
  priority: 'high' | 'medium' | 'low';
  description: string;
}

export interface ConfidenceHistory {
  timestamp: Date;
  confidence: number;
  accuracy: number;
  feedback: number;
  rule: string;
}

export class ConfidenceEvolution {
  private confidenceHistory: ConfidenceHistory[] = [];
  private evolutionRules: EvolutionRule[] = [];
  private userAccuracyHistory: Map<string, number[]> = new Map();
  private patternConfidenceMap: Map<string, number> = new Map();

  constructor() {
    console.log("🎯 ConfidenceEvolution initialized.");
    this.initializeEvolutionRules();
  }

  /**
   * 初始化进化规则
   */
  private initializeEvolutionRules(): void {
    this.evolutionRules = [
      {
        id: 'high-accuracy-boost',
        condition: 'userAccuracy > 0.8',
        adjustment: 0.1,
        priority: 'high',
        description: '高准确率用户提升置信度'
      },
      {
        id: 'low-accuracy-reduction',
        condition: 'userAccuracy < 0.5',
        adjustment: -0.15,
        priority: 'high',
        description: '低准确率用户降低置信度'
      },
      {
        id: 'consistent-feedback-boost',
        condition: 'feedbackQuality > 0.7 && patternMatch > 0.8',
        adjustment: 0.05,
        priority: 'medium',
        description: '一致反馈提升置信度'
      },
      {
        id: 'pattern-learning-boost',
        condition: 'patternMatch > 0.9',
        adjustment: 0.08,
        priority: 'medium',
        description: '模式学习成功提升置信度'
      },
      {
        id: 'historical-improvement',
        condition: 'historicalPerformance > 0.1',
        adjustment: 0.03,
        priority: 'low',
        description: '历史性能改善提升置信度'
      }
    ];

    console.log('🔧 初始化置信度进化规则:', this.evolutionRules.length);
  }

  /**
   * 计算动态置信度
   */
  calculateDynamicConfidence(
    userId: string,
    baseConfidence: number,
    userAccuracy: number,
    feedbackQuality: number,
    patternMatch: number
  ): ConfidenceMetrics {
    // 获取历史性能
    const historicalPerformance = this.calculateHistoricalPerformance(userId);
    
    // 应用进化规则
    let adjustedConfidence = baseConfidence;
    const appliedRules: string[] = [];

    for (const rule of this.evolutionRules) {
      if (this.evaluateRule(rule, {
        userAccuracy,
        feedbackQuality,
        patternMatch,
        historicalPerformance
      })) {
        adjustedConfidence += rule.adjustment;
        appliedRules.push(rule.id);
        console.log(`🎯 应用规则 ${rule.id}: ${rule.description}, 调整: ${rule.adjustment}`);
      }
    }

    // 确保置信度在合理范围内
    adjustedConfidence = Math.max(0.1, Math.min(0.95, adjustedConfidence));

    const metrics: ConfidenceMetrics = {
      baseConfidence,
      userAccuracy,
      feedbackQuality,
      patternMatch,
      historicalPerformance,
      finalConfidence: adjustedConfidence
    };

    // 记录置信度历史
    this.recordConfidenceHistory(userId, adjustedConfidence, userAccuracy, feedbackQuality, appliedRules);

    console.log('🎯 置信度计算完成:', metrics);
    return metrics;
  }

  /**
   * 评估进化规则
   */
  private evaluateRule(rule: EvolutionRule, context: {
    userAccuracy: number;
    feedbackQuality: number;
    patternMatch: number;
    historicalPerformance: number;
  }): boolean {
    const { userAccuracy, feedbackQuality, patternMatch, historicalPerformance } = context;

    switch (rule.condition) {
      case 'userAccuracy > 0.8':
        return userAccuracy > 0.8;
      case 'userAccuracy < 0.5':
        return userAccuracy < 0.5;
      case 'feedbackQuality > 0.7 && patternMatch > 0.8':
        return feedbackQuality > 0.7 && patternMatch > 0.8;
      case 'patternMatch > 0.9':
        return patternMatch > 0.9;
      case 'historicalPerformance > 0.1':
        return historicalPerformance > 0.1;
      default:
        return false;
    }
  }

  /**
   * 计算历史性能
   */
  private calculateHistoricalPerformance(userId: string): number {
    const userHistory = this.userAccuracyHistory.get(userId) || [];
    if (userHistory.length < 2) return 0;

    const recent = userHistory.slice(-5);
    const older = userHistory.slice(-10, -5);

    if (older.length === 0) return 0;

    const recentAvg = recent.reduce((sum, acc) => sum + acc, 0) / recent.length;
    const olderAvg = older.reduce((sum, acc) => sum + acc, 0) / older.length;

    return recentAvg - olderAvg;
  }

  /**
   * 记录置信度历史
   */
  private recordConfidenceHistory(
    userId: string,
    confidence: number,
    accuracy: number,
    feedback: number,
    appliedRules: string[]
  ): void {
    const history: ConfidenceHistory = {
      timestamp: new Date(),
      confidence,
      accuracy,
      feedback,
      rule: appliedRules.join(', ')
    };

    this.confidenceHistory.push(history);

    // 更新用户准确率历史
    if (!this.userAccuracyHistory.has(userId)) {
      this.userAccuracyHistory.set(userId, []);
    }
    this.userAccuracyHistory.get(userId)!.push(accuracy);

    // 保持历史记录在合理范围内
    if (this.confidenceHistory.length > 1000) {
      this.confidenceHistory = this.confidenceHistory.slice(-500);
    }
  }

  /**
   * 学习模式置信度
   */
  learnPatternConfidence(pattern: string, success: boolean): void {
    const currentConfidence = this.patternConfidenceMap.get(pattern) || 0.5;
    const adjustment = success ? 0.05 : -0.03;
    const newConfidence = Math.max(0.1, Math.min(0.95, currentConfidence + adjustment));
    
    this.patternConfidenceMap.set(pattern, newConfidence);
    console.log(`🎯 模式学习: ${pattern}, 成功: ${success}, 新置信度: ${newConfidence}`);
  }

  /**
   * 获取模式置信度
   */
  getPatternConfidence(pattern: string): number {
    return this.patternConfidenceMap.get(pattern) || 0.5;
  }

  /**
   * 生成置信度报告
   */
  generateConfidenceReport(userId?: string): {
    overallConfidence: number;
    trend: 'improving' | 'stable' | 'declining';
    topRules: string[];
    recommendations: string[];
  } {
    const relevantHistory = userId 
      ? this.confidenceHistory.filter(h => h.rule.includes(userId))
      : this.confidenceHistory;

    if (relevantHistory.length === 0) {
      return {
        overallConfidence: 0.5,
        trend: 'stable',
        topRules: [],
        recommendations: ['需要更多数据来评估置信度']
      };
    }

    // 计算整体置信度
    const recentHistory = relevantHistory.slice(-10);
    const overallConfidence = recentHistory.reduce((sum, h) => sum + h.confidence, 0) / recentHistory.length;

    // 分析趋势
    const trend = this.analyzeConfidenceTrend(relevantHistory);

    // 分析最有效的规则
    const ruleFrequency = new Map<string, number>();
    relevantHistory.forEach(h => {
      h.rule.split(', ').forEach(rule => {
        ruleFrequency.set(rule, (ruleFrequency.get(rule) || 0) + 1);
      });
    });

    const topRules = Array.from(ruleFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([rule]) => rule);

    // 生成建议
    const recommendations = this.generateRecommendations(overallConfidence, trend, topRules);

    return {
      overallConfidence,
      trend,
      topRules,
      recommendations
    };
  }

  /**
   * 分析置信度趋势
   */
  private analyzeConfidenceTrend(history: ConfidenceHistory[]): 'improving' | 'stable' | 'declining' {
    if (history.length < 5) return 'stable';

    const recent = history.slice(-5);
    const older = history.slice(-10, -5);

    if (older.length === 0) return 'stable';

    const recentAvg = recent.reduce((sum, h) => sum + h.confidence, 0) / recent.length;
    const olderAvg = older.reduce((sum, h) => sum + h.confidence, 0) / older.length;

    const change = recentAvg - olderAvg;
    if (change > 0.05) return 'improving';
    if (change < -0.05) return 'declining';
    return 'stable';
  }

  /**
   * 生成优化建议
   */
  private generateRecommendations(
    confidence: number,
    trend: 'improving' | 'stable' | 'declining',
    topRules: string[]
  ): string[] {
    const recommendations: string[] = [];

    if (confidence < 0.6) {
      recommendations.push('置信度较低，建议收集更多用户反馈');
    }

    if (trend === 'declining') {
      recommendations.push('置信度呈下降趋势，建议检查解析规则');
    }

    if (trend === 'improving') {
      recommendations.push('置信度持续改善，系统学习效果良好');
    }

    if (topRules.length > 0) {
      recommendations.push(`最有效的规则: ${topRules.join(', ')}`);
    }

    return recommendations;
  }

  /**
   * 获取置信度历史
   */
  getConfidenceHistory(userId?: string): ConfidenceHistory[] {
    return userId 
      ? this.confidenceHistory.filter(h => h.rule.includes(userId))
      : this.confidenceHistory;
  }

  /**
   * 重置置信度数据
   */
  resetConfidenceData(): void {
    this.confidenceHistory = [];
    this.userAccuracyHistory.clear();
    this.patternConfidenceMap.clear();
    console.log('🔄 置信度数据已重置');
  }
}
