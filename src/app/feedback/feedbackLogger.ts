// src/app/feedback/feedbackLogger.ts
// 📊 反馈日志记录器 - 记录Agent执行结果

export interface FeedbackEntry {
  id: string;
  timestamp: Date;
  sessionId: string;
  userId: string;
  agentId: string;
  action: string;
  input: any;
  output: any;
  success: boolean;
  executionTime: number;
  userFeedback?: {
    rating: number; // 1-5
    comment?: string;
    type: 'positive' | 'negative' | 'neutral';
  };
  systemMetrics: {
    memoryUsage: number;
    cpuUsage: number;
    errorCount: number;
  };
  context: {
    userIntent: any;
    taskClassification: any;
    routingDecision: any;
  };
}

export interface FeedbackStats {
  totalExecutions: number;
  successRate: number;
  averageExecutionTime: number;
  averageRating: number;
  commonErrors: Array<{
    error: string;
    count: number;
    frequency: number;
  }>;
  agentPerformance: Record<string, {
    executions: number;
    successRate: number;
    averageTime: number;
    averageRating: number;
  }>;
  userSatisfaction: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export interface FeedbackQuery {
  sessionId?: string;
  userId?: string;
  agentId?: string;
  action?: string;
  success?: boolean;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export class FeedbackLogger {
  private feedbackEntries: Map<string, FeedbackEntry> = new Map();
  private maxEntries: number = 10000; // 最大存储条目数

  constructor() {
    console.log('📊 初始化反馈日志记录器');
  }

  /**
   * 记录反馈
   * @param entry 反馈条目
   */
  async logFeedback(entry: Omit<FeedbackEntry, 'id' | 'timestamp'>): Promise<string> {
    const feedbackId = this.generateFeedbackId();
    const timestamp = new Date();
    
    const feedbackEntry: FeedbackEntry = {
      id: feedbackId,
      timestamp,
      ...entry
    };
    
    console.log('📝 记录反馈:', { id: feedbackId, agentId: entry.agentId, success: entry.success });
    
    // 存储反馈条目
    this.feedbackEntries.set(feedbackId, feedbackEntry);
    
    // 维护存储大小
    this.maintainStorageSize();
    
    return feedbackId;
  }

  /**
   * 记录Agent执行结果
   * @param sessionId 会话ID
   * @param userId 用户ID
   * @param agentId Agent ID
   * @param action 执行动作
   * @param input 输入数据
   * @param output 输出数据
   * @param success 是否成功
   * @param executionTime 执行时间
   * @param context 上下文信息
   */
  async logAgentExecution(
    sessionId: string,
    userId: string,
    agentId: string,
    action: string,
    input: any,
    output: any,
    success: boolean,
    executionTime: number,
    context: any
  ): Promise<string> {
    const entry: Omit<FeedbackEntry, 'id' | 'timestamp'> = {
      sessionId,
      userId,
      agentId,
      action,
      input: this.sanitizeInput(input),
      output: this.sanitizeOutput(output),
      success,
      executionTime,
      systemMetrics: await this.getSystemMetrics(),
      context: {
        userIntent: context.userIntent,
        taskClassification: context.taskClassification,
        routingDecision: context.routingDecision
      }
    };
    
    return await this.logFeedback(entry);
  }

  /**
   * 记录用户反馈
   * @param feedbackId 反馈ID
   * @param rating 评分 (1-5)
   * @param comment 评论
   * @param type 反馈类型
   */
  async logUserFeedback(
    feedbackId: string,
    rating: number,
    comment?: string,
    type: 'positive' | 'negative' | 'neutral' = 'neutral'
  ): Promise<boolean> {
    const entry = this.feedbackEntries.get(feedbackId);
    if (!entry) {
      console.warn('⚠️ 未找到反馈条目:', feedbackId);
      return false;
    }
    
    entry.userFeedback = {
      rating: Math.max(1, Math.min(5, rating)),
      comment,
      type
    };
    
    console.log('👍 记录用户反馈:', { feedbackId, rating, type });
    return true;
  }

  /**
   * 查询反馈
   * @param query 查询条件
   * @returns 反馈条目列表
   */
  async queryFeedback(query: FeedbackQuery): Promise<FeedbackEntry[]> {
    console.log('🔍 查询反馈:', query);
    
    let entries = Array.from(this.feedbackEntries.values());
    
    // 应用过滤条件
    if (query.sessionId) {
      entries = entries.filter(e => e.sessionId === query.sessionId);
    }
    
    if (query.userId) {
      entries = entries.filter(e => e.userId === query.userId);
    }
    
    if (query.agentId) {
      entries = entries.filter(e => e.agentId === query.agentId);
    }
    
    if (query.action) {
      entries = entries.filter(e => e.action === query.action);
    }
    
    if (query.success !== undefined) {
      entries = entries.filter(e => e.success === query.success);
    }
    
    if (query.startDate) {
      entries = entries.filter(e => e.timestamp >= query.startDate!);
    }
    
    if (query.endDate) {
      entries = entries.filter(e => e.timestamp <= query.endDate!);
    }
    
    // 排序
    entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    // 分页
    const offset = query.offset || 0;
    const limit = query.limit || 100;
    
    return entries.slice(offset, offset + limit);
  }

  /**
   * 获取反馈统计
   * @param timeRange 时间范围（天）
   * @returns 统计信息
   */
  async getFeedbackStats(timeRange: number = 30): Promise<FeedbackStats> {
    console.log('📊 获取反馈统计:', { timeRange });
    
    const cutoffDate = new Date(Date.now() - timeRange * 24 * 60 * 60 * 1000);
    const recentEntries = Array.from(this.feedbackEntries.values())
      .filter(e => e.timestamp >= cutoffDate);
    
    const totalExecutions = recentEntries.length;
    const successfulExecutions = recentEntries.filter(e => e.success).length;
    const successRate = totalExecutions > 0 ? successfulExecutions / totalExecutions : 0;
    
    const averageExecutionTime = totalExecutions > 0 ? 
      recentEntries.reduce((sum, e) => sum + e.executionTime, 0) / totalExecutions : 0;
    
    // 计算平均评分
    const ratedEntries = recentEntries.filter(e => e.userFeedback?.rating);
    const averageRating = ratedEntries.length > 0 ? 
      ratedEntries.reduce((sum, e) => sum + (e.userFeedback?.rating || 0), 0) / ratedEntries.length : 0;
    
    // 统计常见错误
    const errorCounts = new Map<string, number>();
    recentEntries.filter(e => !e.success).forEach(e => {
      const error = e.output?.error || 'Unknown error';
      errorCounts.set(error, (errorCounts.get(error) || 0) + 1);
    });
    
    const commonErrors = Array.from(errorCounts.entries())
      .map(([error, count]) => ({
        error,
        count,
        frequency: count / totalExecutions
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // 统计Agent性能
    const agentPerformance: Record<string, any> = {};
    const agentGroups = new Map<string, FeedbackEntry[]>();
    
    recentEntries.forEach(e => {
      if (!agentGroups.has(e.agentId)) {
        agentGroups.set(e.agentId, []);
      }
      agentGroups.get(e.agentId)!.push(e);
    });
    
    agentGroups.forEach((entries, agentId) => {
      const agentSuccesses = entries.filter(e => e.success).length;
      const agentAvgTime = entries.reduce((sum, e) => sum + e.executionTime, 0) / entries.length;
      const agentRatedEntries = entries.filter(e => e.userFeedback?.rating);
      const agentAvgRating = agentRatedEntries.length > 0 ? 
        agentRatedEntries.reduce((sum, e) => sum + (e.userFeedback?.rating || 0), 0) / agentRatedEntries.length : 0;
      
      agentPerformance[agentId] = {
        executions: entries.length,
        successRate: agentSuccesses / entries.length,
        averageTime: agentAvgTime,
        averageRating: agentAvgRating
      };
    });
    
    // 统计用户满意度
    const userSatisfaction = {
      positive: recentEntries.filter(e => e.userFeedback?.type === 'positive').length,
      neutral: recentEntries.filter(e => e.userFeedback?.type === 'neutral').length,
      negative: recentEntries.filter(e => e.userFeedback?.type === 'negative').length
    };
    
    return {
      totalExecutions,
      successRate,
      averageExecutionTime,
      averageRating,
      commonErrors,
      agentPerformance,
      userSatisfaction
    };
  }

  /**
   * 获取Agent性能报告
   * @param agentId Agent ID
   * @param timeRange 时间范围（天）
   * @returns 性能报告
   */
  async getAgentPerformanceReport(agentId: string, timeRange: number = 30): Promise<any> {
    console.log('📈 获取Agent性能报告:', { agentId, timeRange });
    
    const cutoffDate = new Date(Date.now() - timeRange * 24 * 60 * 60 * 1000);
    const agentEntries = Array.from(this.feedbackEntries.values())
      .filter(e => e.agentId === agentId && e.timestamp >= cutoffDate);
    
    if (agentEntries.length === 0) {
      return {
        agentId,
        message: 'No data available for the specified time range'
      };
    }
    
    const successfulEntries = agentEntries.filter(e => e.success);
    const failedEntries = agentEntries.filter(e => !e.success);
    
    return {
      agentId,
      timeRange,
      totalExecutions: agentEntries.length,
      successRate: successfulEntries.length / agentEntries.length,
      averageExecutionTime: agentEntries.reduce((sum, e) => sum + e.executionTime, 0) / agentEntries.length,
      errorRate: failedEntries.length / agentEntries.length,
      commonErrors: this.getCommonErrors(failedEntries),
      performanceTrend: this.calculatePerformanceTrend(agentEntries),
      recommendations: this.generatePerformanceRecommendations(agentEntries)
    };
  }

  /**
   * 导出反馈数据
   * @param format 导出格式
   * @param query 查询条件
   * @returns 导出的数据
   */
  async exportFeedback(format: 'json' | 'csv', query?: FeedbackQuery): Promise<string> {
    console.log('📤 导出反馈数据:', { format, query });
    
    const entries = query ? await this.queryFeedback(query) : Array.from(this.feedbackEntries.values());
    
    if (format === 'json') {
      return JSON.stringify(entries, null, 2);
    } else if (format === 'csv') {
      return this.convertToCSV(entries);
    }
    
    throw new Error(`Unsupported export format: ${format}`);
  }

  /**
   * 清理过期数据
   * @param daysToKeep 保留天数
   */
  async cleanupOldData(daysToKeep: number = 90): Promise<number> {
    console.log('🧹 清理过期数据:', { daysToKeep });
    
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
    const entriesToDelete: string[] = [];
    
    this.feedbackEntries.forEach((entry, id) => {
      if (entry.timestamp < cutoffDate) {
        entriesToDelete.push(id);
      }
    });
    
    entriesToDelete.forEach(id => {
      this.feedbackEntries.delete(id);
    });
    
    console.log(`🗑️ 删除了 ${entriesToDelete.length} 条过期数据`);
    return entriesToDelete.length;
  }

  // 私有辅助方法

  private generateFeedbackId(): string {
    return `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private maintainStorageSize(): void {
    if (this.feedbackEntries.size > this.maxEntries) {
      const entries = Array.from(this.feedbackEntries.entries());
      entries.sort((a, b) => a[1].timestamp.getTime() - b[1].timestamp.getTime());
      
      const toDelete = entries.slice(0, this.feedbackEntries.size - this.maxEntries);
      toDelete.forEach(([id]) => {
        this.feedbackEntries.delete(id);
      });
      
      console.log(`🗑️ 清理了 ${toDelete.length} 条旧数据以维护存储大小`);
    }
  }

  private sanitizeInput(input: any): any {
    // TODO: 实现输入数据清理，移除敏感信息
    return input;
  }

  private sanitizeOutput(output: any): any {
    // TODO: 实现输出数据清理，移除敏感信息
    return output;
  }

  private async getSystemMetrics(): Promise<any> {
    // TODO: 实现系统指标获取
    return {
      memoryUsage: 0,
      cpuUsage: 0,
      errorCount: 0
    };
  }

  private getCommonErrors(failedEntries: FeedbackEntry[]): Array<{ error: string; count: number }> {
    const errorCounts = new Map<string, number>();
    
    failedEntries.forEach(entry => {
      const error = entry.output?.error || 'Unknown error';
      errorCounts.set(error, (errorCounts.get(error) || 0) + 1);
    });
    
    return Array.from(errorCounts.entries())
      .map(([error, count]) => ({ error, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private calculatePerformanceTrend(entries: FeedbackEntry[]): any {
    // TODO: 实现性能趋势计算
    return {
      direction: 'stable',
      change: 0
    };
  }

  private generatePerformanceRecommendations(entries: FeedbackEntry[]): string[] {
    // TODO: 实现性能建议生成
    return ['建议优化执行时间', '建议提高成功率'];
  }

  private convertToCSV(entries: FeedbackEntry[]): string {
    if (entries.length === 0) return '';
    
    const headers = [
      'id', 'timestamp', 'sessionId', 'userId', 'agentId', 'action',
      'success', 'executionTime', 'rating', 'comment', 'type'
    ];
    
    const rows = entries.map(entry => [
      entry.id,
      entry.timestamp.toISOString(),
      entry.sessionId,
      entry.userId,
      entry.agentId,
      entry.action,
      entry.success,
      entry.executionTime,
      entry.userFeedback?.rating || '',
      entry.userFeedback?.comment || '',
      entry.userFeedback?.type || ''
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    return csvContent;
  }
}
