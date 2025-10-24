// src/app/feedback/promptMonitor.ts
// 📊 Prompt性能监控器 - 分析性能指标

export interface PromptMetrics {
  promptId: string;
  promptVersion: string;
  agentId: string;
  action: string;
  executionCount: number;
  successCount: number;
  failureCount: number;
  averageExecutionTime: number;
  averageRating: number;
  lastUsed: Date;
  performanceTrend: 'improving' | 'stable' | 'declining';
  issues: string[];
  recommendations: string[];
}

export interface PerformanceAlert {
  id: string;
  type: 'performance' | 'error_rate' | 'user_satisfaction' | 'execution_time';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  promptId: string;
  agentId: string;
  timestamp: Date;
  resolved: boolean;
  resolution?: string;
}

export interface PromptComparison {
  promptId1: string;
  promptId2: string;
  metrics1: PromptMetrics;
  metrics2: PromptMetrics;
  winner: string;
  improvement: {
    successRate: number;
    executionTime: number;
    userRating: number;
  };
}

export interface MonitoringConfig {
  alertThresholds: {
    successRate: number; // 最低成功率
    executionTime: number; // 最大执行时间（毫秒）
    userRating: number; // 最低用户评分
    errorRate: number; // 最大错误率
  };
  monitoringWindow: number; // 监控窗口（小时）
  alertCooldown: number; // 告警冷却时间（小时）
}

export class PromptMonitor {
  private promptMetrics: Map<string, PromptMetrics> = new Map();
  private performanceAlerts: Map<string, PerformanceAlert> = new Map();
  private monitoringConfig: MonitoringConfig;
  private feedbackLogger: any; // TODO: 集成 feedbackLogger

  constructor(feedbackLogger: any, config?: Partial<MonitoringConfig>) {
    this.feedbackLogger = feedbackLogger;
    this.monitoringConfig = {
      alertThresholds: {
        successRate: 0.8,
        executionTime: 10000,
        userRating: 3.0,
        errorRate: 0.2
      },
      monitoringWindow: 24,
      alertCooldown: 1,
      ...config
    };
    
    console.log('📊 初始化Prompt性能监控器');
  }

  /**
   * 更新Prompt指标
   * @param promptId Prompt ID
   * @param agentId Agent ID
   * @param action 执行动作
   * @param executionResult 执行结果
   */
  async updatePromptMetrics(
    promptId: string,
    agentId: string,
    action: string,
    executionResult: {
      success: boolean;
      executionTime: number;
      userRating?: number;
      error?: string;
    }
  ): Promise<void> {
    console.log('📈 更新Prompt指标:', { promptId, agentId, action, executionResult });
    
    const metricsKey = `${promptId}_${agentId}_${action}`;
    let metrics = this.promptMetrics.get(metricsKey);
    
    if (!metrics) {
      metrics = {
        promptId,
        promptVersion: '1.0.0', // TODO: 从实际Prompt获取版本
        agentId,
        action,
        executionCount: 0,
        successCount: 0,
        failureCount: 0,
        averageExecutionTime: 0,
        averageRating: 0,
        lastUsed: new Date(),
        performanceTrend: 'stable',
        issues: [],
        recommendations: []
      };
    }
    
    // 更新指标
    metrics.executionCount++;
    metrics.lastUsed = new Date();
    
    if (executionResult.success) {
      metrics.successCount++;
    } else {
      metrics.failureCount++;
    }
    
    // 更新平均执行时间
    const totalTime = metrics.averageExecutionTime * (metrics.executionCount - 1) + executionResult.executionTime;
    metrics.averageExecutionTime = totalTime / metrics.executionCount;
    
    // 更新平均评分
    if (executionResult.userRating) {
      const totalRating = metrics.averageRating * (metrics.executionCount - 1) + executionResult.userRating;
      metrics.averageRating = totalRating / metrics.executionCount;
    }
    
    // 分析性能趋势
    metrics.performanceTrend = this.analyzePerformanceTrend(metrics);
    
    // 识别问题
    metrics.issues = this.identifyIssues(metrics);
    
    // 生成建议
    metrics.recommendations = this.generateRecommendations(metrics);
    
    // 存储更新后的指标
    this.promptMetrics.set(metricsKey, metrics);
    
    // 检查是否需要发送告警
    await this.checkPerformanceAlerts(metrics);
  }

  /**
   * 获取Prompt指标
   * @param promptId Prompt ID
   * @param agentId Agent ID
   * @param action 执行动作
   * @returns Prompt指标
   */
  getPromptMetrics(promptId: string, agentId: string, action: string): PromptMetrics | null {
    const metricsKey = `${promptId}_${agentId}_${action}`;
    return this.promptMetrics.get(metricsKey) || null;
  }

  /**
   * 获取所有Prompt指标
   * @returns 所有Prompt指标
   */
  getAllPromptMetrics(): PromptMetrics[] {
    return Array.from(this.promptMetrics.values());
  }

  /**
   * 比较两个Prompt的性能
   * @param promptId1 第一个Prompt ID
   * @param promptId2 第二个Prompt ID
   * @param agentId Agent ID
   * @param action 执行动作
   * @returns 比较结果
   */
  comparePrompts(
    promptId1: string,
    promptId2: string,
    agentId: string,
    action: string
  ): PromptComparison | null {
    const metrics1 = this.getPromptMetrics(promptId1, agentId, action);
    const metrics2 = this.getPromptMetrics(promptId2, agentId, action);
    
    if (!metrics1 || !metrics2) {
      return null;
    }
    
    const successRate1 = metrics1.successCount / metrics1.executionCount;
    const successRate2 = metrics2.successCount / metrics2.executionCount;
    
    const winner = this.determineWinner(metrics1, metrics2);
    
    const improvement = {
      successRate: successRate2 - successRate1,
      executionTime: metrics1.averageExecutionTime - metrics2.averageExecutionTime,
      userRating: metrics2.averageRating - metrics1.averageRating
    };
    
    return {
      promptId1,
      promptId2,
      metrics1,
      metrics2,
      winner,
      improvement
    };
  }

  /**
   * 获取性能告警
   * @param resolved 是否只获取未解决的告警
   * @returns 告警列表
   */
  getPerformanceAlerts(resolved: boolean = false): PerformanceAlert[] {
    const alerts = Array.from(this.performanceAlerts.values());
    return resolved ? alerts : alerts.filter(alert => !alert.resolved);
  }

  /**
   * 解决告警
   * @param alertId 告警ID
   * @param resolution 解决方案
   */
  resolveAlert(alertId: string, resolution: string): boolean {
    const alert = this.performanceAlerts.get(alertId);
    if (!alert) {
      return false;
    }
    
    alert.resolved = true;
    alert.resolution = resolution;
    
    console.log('✅ 解决告警:', { alertId, resolution });
    return true;
  }

  /**
   * 生成性能报告
   * @param timeRange 时间范围（小时）
   * @returns 性能报告
   */
  async generatePerformanceReport(timeRange: number = 24): Promise<any> {
    console.log('📊 生成性能报告:', { timeRange });
    
    const cutoffTime = new Date(Date.now() - timeRange * 60 * 60 * 1000);
    const recentMetrics = Array.from(this.promptMetrics.values())
      .filter(metrics => metrics.lastUsed >= cutoffTime);
    
    if (recentMetrics.length === 0) {
      return {
        message: 'No data available for the specified time range',
        timeRange
      };
    }
    
    // 计算总体指标
    const totalExecutions = recentMetrics.reduce((sum, m) => sum + m.executionCount, 0);
    const totalSuccesses = recentMetrics.reduce((sum, m) => sum + m.successCount, 0);
    const overallSuccessRate = totalExecutions > 0 ? totalSuccesses / totalExecutions : 0;
    
    const avgExecutionTime = recentMetrics.reduce((sum, m) => sum + m.averageExecutionTime, 0) / recentMetrics.length;
    const avgRating = recentMetrics.reduce((sum, m) => sum + m.averageRating, 0) / recentMetrics.length;
    
    // 识别最佳和最差表现
    const bestPerforming = recentMetrics.reduce((best, current) => 
      (current.successCount / current.executionCount) > (best.successCount / best.executionCount) ? current : best
    );
    
    const worstPerforming = recentMetrics.reduce((worst, current) => 
      (current.successCount / current.executionCount) < (worst.successCount / worst.executionCount) ? current : worst
    );
    
    // 统计告警
    const activeAlerts = this.getPerformanceAlerts(false);
    const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical');
    
    return {
      timeRange,
      summary: {
        totalPrompts: recentMetrics.length,
        totalExecutions,
        overallSuccessRate,
        averageExecutionTime: avgExecutionTime,
        averageRating: avgRating,
        activeAlerts: activeAlerts.length,
        criticalAlerts: criticalAlerts.length
      },
      bestPerforming: {
        promptId: bestPerforming.promptId,
        agentId: bestPerforming.agentId,
        successRate: bestPerforming.successCount / bestPerforming.executionCount,
        averageTime: bestPerforming.averageExecutionTime
      },
      worstPerforming: {
        promptId: worstPerforming.promptId,
        agentId: worstPerforming.agentId,
        successRate: worstPerforming.successCount / worstPerforming.executionCount,
        averageTime: worstPerforming.averageExecutionTime
      },
      recommendations: this.generateSystemRecommendations(recentMetrics),
      trends: this.analyzeSystemTrends(recentMetrics)
    };
  }

  /**
   * 自动优化建议
   * @param promptId Prompt ID
   * @param agentId Agent ID
   * @param action 执行动作
   * @returns 优化建议
   */
  getOptimizationSuggestions(promptId: string, agentId: string, action: string): string[] {
    const metrics = this.getPromptMetrics(promptId, agentId, action);
    if (!metrics) {
      return ['No data available for optimization suggestions'];
    }
    
    const suggestions: string[] = [];
    const successRate = metrics.successCount / metrics.executionCount;
    
    if (successRate < this.monitoringConfig.alertThresholds.successRate) {
      suggestions.push('Success rate is below threshold. Consider revising the prompt for better clarity and specificity.');
    }
    
    if (metrics.averageExecutionTime > this.monitoringConfig.alertThresholds.executionTime) {
      suggestions.push('Execution time is above threshold. Consider simplifying the prompt or optimizing the processing logic.');
    }
    
    if (metrics.averageRating < this.monitoringConfig.alertThresholds.userRating) {
      suggestions.push('User satisfaction is below threshold. Consider improving the output quality and relevance.');
    }
    
    if (metrics.performanceTrend === 'declining') {
      suggestions.push('Performance is declining. Consider reverting to a previous version or implementing fixes.');
    }
    
    if (metrics.issues.length > 0) {
      suggestions.push(`Address identified issues: ${metrics.issues.join(', ')}`);
    }
    
    return suggestions;
  }

  // 私有辅助方法

  private analyzePerformanceTrend(metrics: PromptMetrics): 'improving' | 'stable' | 'declining' {
    // TODO: 实现性能趋势分析
    // 基于历史数据计算趋势
    return 'stable';
  }

  private identifyIssues(metrics: PromptMetrics): string[] {
    const issues: string[] = [];
    const successRate = metrics.successCount / metrics.executionCount;
    
    if (successRate < this.monitoringConfig.alertThresholds.successRate) {
      issues.push('Low success rate');
    }
    
    if (metrics.averageExecutionTime > this.monitoringConfig.alertThresholds.executionTime) {
      issues.push('High execution time');
    }
    
    if (metrics.averageRating < this.monitoringConfig.alertThresholds.userRating) {
      issues.push('Low user satisfaction');
    }
    
    return issues;
  }

  private generateRecommendations(metrics: PromptMetrics): string[] {
    const recommendations: string[] = [];
    
    if (metrics.issues.includes('Low success rate')) {
      recommendations.push('Improve prompt clarity and add more specific instructions');
    }
    
    if (metrics.issues.includes('High execution time')) {
      recommendations.push('Optimize prompt length and complexity');
    }
    
    if (metrics.issues.includes('Low user satisfaction')) {
      recommendations.push('Enhance output quality and relevance');
    }
    
    return recommendations;
  }

  private async checkPerformanceAlerts(metrics: PromptMetrics): Promise<void> {
    const successRate = metrics.successCount / metrics.executionCount;
    const errorRate = metrics.failureCount / metrics.executionCount;
    
    // 检查成功率告警
    if (successRate < this.monitoringConfig.alertThresholds.successRate) {
      await this.createAlert('error_rate', 'high', 
        `Low success rate for ${metrics.promptId}: ${(successRate * 100).toFixed(1)}%`,
        metrics.promptId, metrics.agentId);
    }
    
    // 检查执行时间告警
    if (metrics.averageExecutionTime > this.monitoringConfig.alertThresholds.executionTime) {
      await this.createAlert('execution_time', 'medium',
        `High execution time for ${metrics.promptId}: ${metrics.averageExecutionTime.toFixed(0)}ms`,
        metrics.promptId, metrics.agentId);
    }
    
    // 检查用户满意度告警
    if (metrics.averageRating < this.monitoringConfig.alertThresholds.userRating) {
      await this.createAlert('user_satisfaction', 'medium',
        `Low user rating for ${metrics.promptId}: ${metrics.averageRating.toFixed(1)}/5`,
        metrics.promptId, metrics.agentId);
    }
  }

  private async createAlert(
    type: PerformanceAlert['type'],
    severity: PerformanceAlert['severity'],
    message: string,
    promptId: string,
    agentId: string
  ): Promise<void> {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const alert: PerformanceAlert = {
      id: alertId,
      type,
      severity,
      message,
      promptId,
      agentId,
      timestamp: new Date(),
      resolved: false
    };
    
    this.performanceAlerts.set(alertId, alert);
    console.log('🚨 创建性能告警:', alert);
  }

  private determineWinner(metrics1: PromptMetrics, metrics2: PromptMetrics): string {
    const score1 = this.calculatePromptScore(metrics1);
    const score2 = this.calculatePromptScore(metrics2);
    
    return score1 > score2 ? metrics1.promptId : metrics2.promptId;
  }

  private calculatePromptScore(metrics: PromptMetrics): number {
    const successRate = metrics.successCount / metrics.executionCount;
    const timeScore = Math.max(0, 1 - (metrics.averageExecutionTime / this.monitoringConfig.alertThresholds.executionTime));
    const ratingScore = metrics.averageRating / 5;
    
    return (successRate * 0.4) + (timeScore * 0.3) + (ratingScore * 0.3);
  }

  private generateSystemRecommendations(metrics: PromptMetrics[]): string[] {
    const recommendations: string[] = [];
    
    const avgSuccessRate = metrics.reduce((sum, m) => sum + (m.successCount / m.executionCount), 0) / metrics.length;
    const avgExecutionTime = metrics.reduce((sum, m) => sum + m.averageExecutionTime, 0) / metrics.length;
    
    if (avgSuccessRate < 0.8) {
      recommendations.push('Overall system success rate is below 80%. Consider reviewing and updating prompts across all agents.');
    }
    
    if (avgExecutionTime > 5000) {
      recommendations.push('Average execution time is high. Consider optimizing system performance and prompt efficiency.');
    }
    
    return recommendations;
  }

  private analyzeSystemTrends(metrics: PromptMetrics[]): any {
    // TODO: 实现系统趋势分析
    return {
      direction: 'stable',
      change: 0
    };
  }
}
