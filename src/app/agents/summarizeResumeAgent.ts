// src/app/agents/summarizeResumeAgent.ts
// 📝 简历总结Agent - 专门处理简历摘要生成任务

import { IAgent } from './base/IAgent';

export interface SummarizeResumeRequest {
  resumeData: any[];
  options?: {
    length?: 'brief' | 'medium' | 'detailed';
    focus?: string[];
    format?: 'text' | 'bullet' | 'paragraph';
  };
}

export interface SummarizeResumeResponse {
  success: boolean;
  summary?: string;
  error?: string;
}

export class SummarizeResumeAgent implements IAgent {
  id = 'summarizeResumeAgent';
  name = 'Resume Summarizer';
  description = '生成简历摘要和总结';
  status: 'available' | 'busy' | 'disabled' = 'available';
  capabilities = ['summarize', 'extract', 'format'];
  dependencies: string[] = ['parseResumeAgent'];
  private version: string = '1.0.0';

  /**
   * 执行简历总结
   * @param parameters 总结参数
   * @returns 总结结果
   */
  async execute(parameters: Record<string, any>): Promise<SummarizeResumeResponse> {
    console.log('📝 SummarizeResumeAgent执行:', parameters);
    
    try {
      const { resumeData, options = {} } = parameters as SummarizeResumeRequest;
      
      if (!resumeData || !Array.isArray(resumeData)) {
        throw new Error('简历数据格式不正确');
      }

      // 生成简历摘要
      const summary = this.generateSummary(resumeData, options);

      return {
        success: true,
        summary
      };

    } catch (error) {
      console.error('❌ SummarizeResumeAgent执行失败:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 生成简历摘要
   * @param resumeData 简历数据
   * @param options 选项
   * @returns 摘要文本
   */
  private generateSummary(resumeData: any[], options: any): string {
    const sections = resumeData.map(section => section.title).join(', ');
    const fieldCount = resumeData.reduce((total, section) => 
      total + (section.fields?.length || 0), 0
    );
    
    return `简历包含 ${resumeData.length} 个部分 (${sections})，共 ${fieldCount} 个字段。`;
  }

  /**
   * 健康检查
   * @returns 健康状态
   */
  async healthCheck(): Promise<boolean> {
    return true;
  }

  /**
   * 获取Agent信息
   * @returns Agent信息
   */
  getInfo(): { name: string; version: string; capabilities: string[] } {
    return {
      name: this.name,
      version: this.version,
      capabilities: ['summarize', 'extract', 'analyze']
    };
  }
}