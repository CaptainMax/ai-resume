// src/app/agents/parseResumeAgent.ts
// 📄 简历解析Agent - 专门处理简历解析任务

export interface ParseResumeRequest {
  resumeText: string;
  options?: {
    format?: 'json' | 'structured';
    includeMetadata?: boolean;
    confidence?: boolean;
  };
}

export interface ParseResumeResponse {
  success: boolean;
  data?: any[];
  error?: string;
  metadata?: {
    confidence: number;
    source: string;
    parseTime: number;
  };
}

export class ParseResumeAgent {
  private name: string = 'ParseResumeAgent';
  private version: string = '1.0.0';

  /**
   * 执行简历解析
   * @param parameters 解析参数
   * @returns 解析结果
   */
  async execute(parameters: Record<string, any>): Promise<ParseResumeResponse> {
    console.log('📄 ParseResumeAgent执行:', parameters);
    
    try {
      const { resumeText, options = {} } = parameters as ParseResumeRequest;
      
      if (!resumeText) {
        throw new Error('简历文本不能为空');
      }

      // 调用API进行解析
      const response = await fetch('/api/parseResume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, ...options })
      });

      if (!response.ok) {
        throw new Error(`API调用失败: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '解析失败');
      }

      return {
        success: true,
        data: result.data,
        metadata: {
          confidence: result.confidence?.final || 0.8,
          source: result.source || 'ParseResumeAgent',
          parseTime: Date.now()
        }
      };

    } catch (error) {
      console.error('❌ ParseResumeAgent执行失败:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 健康检查
   * @returns 健康状态
   */
  async healthCheck(): Promise<boolean> {
    try {
      // 简单的健康检查 - 测试API是否可访问
      const response = await fetch('/api/parseResume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: 'test' })
      });
      
      return response.status !== 404; // 只要不是404就认为健康
    } catch (error) {
      console.error('❌ ParseResumeAgent健康检查失败:', error);
      return false;
    }
  }

  /**
   * 获取Agent信息
   * @returns Agent信息
   */
  getInfo(): { name: string; version: string; capabilities: string[] } {
    return {
      name: this.name,
      version: this.version,
      capabilities: ['parse', 'validate', 'structure']
    };
  }
}