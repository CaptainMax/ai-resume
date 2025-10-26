// src/app/agents/base/IAgent.ts
// 🤖 Agent 基础接口定义

export interface IAgent {
  id: string;
  name: string;
  description: string;
  status: 'available' | 'busy' | 'disabled';
  capabilities: string[];
  dependencies?: string[];
  execute(task: any): Promise<any>;
  healthCheck?(): Promise<boolean>;
}

export interface AgentExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTime?: number;
  metadata?: {
    agentId: string;
    timestamp: Date;
    parameters: Record<string, any>;
  };
}
