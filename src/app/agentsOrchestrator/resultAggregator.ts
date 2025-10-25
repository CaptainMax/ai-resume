// src/app/agentsOrchestrator/resultAggregator.ts
// 📊 结果聚合器 - 整合多个Agent的执行结果

import { ExecutionResult, TaskExecutionStatus } from './taskExecutor';

export interface AggregatedResult {
  success: boolean;
  data: any;
  errors: string[];
  warnings: string[];
  executionTime: number;
  agentResults: Record<string, any>;
  summary: string;
}

export interface ResultConflict {
  type: 'data_conflict' | 'format_mismatch' | 'validation_error';
  description: string;
  conflictingResults: any[];
  resolution: 'auto' | 'manual' | 'pending';
}

export class ResultAggregator {
  private conflictResolutionRules: Map<string, Function> = new Map();

  constructor() {
    this.initializeConflictResolutionRules();
    console.log("📊 ResultAggregator initialized");
  }

  /**
   * 🎯 聚合执行结果
   */
  aggregateResults(
    executionStatus: TaskExecutionStatus,
    results: ExecutionResult[]
  ): AggregatedResult {
    console.log("📊 开始聚合结果:", executionStatus.planId);

    const successfulResults = results.filter(r => r.success);
    const failedResults = results.filter(r => !r.success);
    
    const agentResults: Record<string, any> = {};
    const errors: string[] = [];
    const warnings: string[] = [];

    // 处理成功的结果
    for (const result of successfulResults) {
      if (result.result) {
        agentResults[result.stepId] = result.result;
      }
    }

    // 处理失败的结果
    for (const result of failedResults) {
      if (result.error) {
        errors.push(`${result.stepId}: ${result.error}`);
      }
    }

    // 检查结果冲突
    const conflicts = this.detectConflicts(agentResults);
    for (const conflict of conflicts) {
      warnings.push(`冲突检测: ${conflict.description}`);
    }

    // 整合数据
    const aggregatedData = this.mergeResults(agentResults, conflicts);
    
    // 生成摘要
    const summary = this.generateSummary(
      successfulResults.length,
      failedResults.length,
      conflicts.length,
      executionStatus
    );

    const totalExecutionTime = results.reduce((sum, r) => sum + r.executionTime, 0);

    const aggregatedResult: AggregatedResult = {
      success: failedResults.length === 0,
      data: aggregatedData,
      errors,
      warnings,
      executionTime: totalExecutionTime,
      agentResults,
      summary
    };

    console.log("✅ 结果聚合完成:", aggregatedResult.summary);
    return aggregatedResult;
  }

  /**
   * 🔍 检测结果冲突
   */
  private detectConflicts(agentResults: Record<string, any>): ResultConflict[] {
    const conflicts: ResultConflict[] = [];
    const results = Object.values(agentResults);

    // 检查数据格式冲突
    const formatConflicts = this.detectFormatConflicts(results);
    conflicts.push(...formatConflicts);

    // 检查数据内容冲突
    const contentConflicts = this.detectContentConflicts(results);
    conflicts.push(...contentConflicts);

    // 检查验证错误
    const validationConflicts = this.detectValidationErrors(results);
    conflicts.push(...validationConflicts);

    return conflicts;
  }

  /**
   * 🔧 检测格式冲突
   */
  private detectFormatConflicts(results: any[]): ResultConflict[] {
    const conflicts: ResultConflict[] = [];
    
    // 检查数组vs对象冲突
    const hasArray = results.some(r => Array.isArray(r));
    const hasObject = results.some(r => r && typeof r === 'object' && !Array.isArray(r));
    
    if (hasArray && hasObject) {
      conflicts.push({
        type: 'format_mismatch',
        description: '检测到数组和对象格式混合',
        conflictingResults: results,
        resolution: 'auto'
      });
    }

    return conflicts;
  }

  /**
   * 🔧 检测内容冲突
   */
  private detectContentConflicts(results: any[]): ResultConflict[] {
    const conflicts: ResultConflict[] = [];
    
    // 检查重复的section名称
    const sectionNames = new Set<string>();
    const duplicateSections: string[] = [];
    
    for (const result of results) {
      if (result && result.sections) {
        for (const section of result.sections) {
          if (section.title) {
            if (sectionNames.has(section.title)) {
              duplicateSections.push(section.title);
            } else {
              sectionNames.add(section.title);
            }
          }
        }
      }
    }

    if (duplicateSections.length > 0) {
      conflicts.push({
        type: 'data_conflict',
        description: `检测到重复的section: ${duplicateSections.join(', ')}`,
        conflictingResults: results,
        resolution: 'auto'
      });
    }

    return conflicts;
  }

  /**
   * 🔧 检测验证错误
   */
  private detectValidationErrors(results: any[]): ResultConflict[] {
    const conflicts: ResultConflict[] = [];
    
    for (const result of results) {
      if (result && result.error) {
        conflicts.push({
          type: 'validation_error',
          description: `验证错误: ${result.error}`,
          conflictingResults: [result],
          resolution: 'manual'
        });
      }
    }

    return conflicts;
  }

  /**
   * 🔄 合并结果
   */
  private mergeResults(
    agentResults: Record<string, any>,
    conflicts: ResultConflict[]
  ): any {
    const results = Object.values(agentResults);
    
    if (results.length === 0) {
      return null;
    }

    if (results.length === 1) {
      return results[0];
    }

    // 处理多个结果
    return this.mergeMultipleResults(results, conflicts);
  }

  /**
   * 🔄 合并多个结果
   */
  private mergeMultipleResults(results: any[], conflicts: ResultConflict[]): any {
    // 优先选择最完整的结果
    const sortedResults = results.sort((a, b) => {
      const aScore = this.calculateResultScore(a);
      const bScore = this.calculateResultScore(b);
      return bScore - aScore;
    });

    const primaryResult = sortedResults[0];
    
    // 如果有冲突，应用冲突解决规则
    for (const conflict of conflicts) {
      if (conflict.resolution === 'auto') {
        this.resolveConflict(primaryResult, conflict);
      }
    }

    return primaryResult;
  }

  /**
   * 📊 计算结果质量分数
   */
  private calculateResultScore(result: any): number {
    let score = 0;
    
    if (result && typeof result === 'object') {
      // 基础分数
      score += 10;
      
      // 如果有sections，根据数量加分
      if (result.sections && Array.isArray(result.sections)) {
        score += result.sections.length * 5;
        
        // 根据section内容质量加分
        for (const section of result.sections) {
          if (section.fields && Array.isArray(section.fields)) {
            score += section.fields.length * 2;
            
            for (const field of section.fields) {
              if (field.points && Array.isArray(field.points)) {
                score += field.points.length;
              }
            }
          }
        }
      }
      
      // 如果有错误，扣分
      if (result.error) {
        score -= 20;
      }
    }
    
    return score;
  }

  /**
   * 🔧 解决冲突
   */
  private resolveConflict(result: any, conflict: ResultConflict): void {
    switch (conflict.type) {
      case 'format_mismatch':
        this.resolveFormatConflict(result, conflict);
        break;
      case 'data_conflict':
        this.resolveDataConflict(result, conflict);
        break;
      case 'validation_error':
        this.resolveValidationError(result, conflict);
        break;
    }
  }

  /**
   * 🔧 解决格式冲突
   */
  private resolveFormatConflict(result: any, conflict: ResultConflict): void {
    // 统一为数组格式
    if (result && !Array.isArray(result)) {
      result = [result];
    }
  }

  /**
   * 🔧 解决数据冲突
   */
  private resolveDataConflict(result: any, conflict: ResultConflict): void {
    // 合并重复的sections
    if (result && result.sections) {
      const sectionMap = new Map();
      
      for (const section of result.sections) {
        const key = section.title;
        if (sectionMap.has(key)) {
          // 合并fields
          const existing = sectionMap.get(key);
          if (existing.fields && section.fields) {
            existing.fields.push(...section.fields);
          }
        } else {
          sectionMap.set(key, section);
        }
      }
      
      result.sections = Array.from(sectionMap.values());
    }
  }

  /**
   * 🔧 解决验证错误
   */
  private resolveValidationError(result: any, conflict: ResultConflict): void {
    // 移除错误标记，保留数据
    if (result && result.error) {
      delete result.error;
    }
  }

  /**
   * 📝 生成摘要
   */
  private generateSummary(
    successCount: number,
    failureCount: number,
    conflictCount: number,
    executionStatus: TaskExecutionStatus
  ): string {
    const totalSteps = successCount + failureCount;
    const successRate = totalSteps > 0 ? (successCount / totalSteps * 100).toFixed(1) : '0';
    
    let summary = `执行完成: ${successCount}/${totalSteps} 步骤成功 (${successRate}%)`;
    
    if (failureCount > 0) {
      summary += `, ${failureCount} 步骤失败`;
    }
    
    if (conflictCount > 0) {
      summary += `, ${conflictCount} 个冲突已自动解决`;
    }
    
    if (executionStatus.executionTime) {
      const duration = executionStatus.executionTime;
      summary += `, 耗时: ${duration}ms`;
    }
    
    return summary;
  }

  /**
   * 🎯 初始化冲突解决规则
   */
  private initializeConflictResolutionRules(): void {
    this.conflictResolutionRules.set('duplicate_sections', (result: any) => {
      // 合并重复sections的逻辑
    });
    
    this.conflictResolutionRules.set('format_standardization', (result: any) => {
      // 格式标准化逻辑
    });
  }

  /**
   * 📊 获取聚合统计
   */
  getAggregationStats(aggregatedResult: AggregatedResult): {
    totalAgents: number;
    successRate: number;
    conflictCount: number;
    executionTime: number;
  } {
    const totalAgents = Object.keys(aggregatedResult.agentResults).length;
    const successRate = aggregatedResult.success ? 100 : 0;
    const conflictCount = aggregatedResult.warnings.length;
    
    return {
      totalAgents,
      successRate,
      conflictCount,
      executionTime: aggregatedResult.executionTime
    };
  }
}
