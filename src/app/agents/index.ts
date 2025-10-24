// src/app/agents/index.ts
// 📋 Agent注册表导出

import { ParseResumeAgent } from './parseResumeAgent';
import { AnalyzeResumeAgent } from './analyzeResumeAgent';
import { ImproveResumeAgent } from './improveResumeAgent';
import { SummarizeResumeAgent } from './summarizeResumeAgent';

// 导出所有Agent类
export {
  ParseResumeAgent,
  AnalyzeResumeAgent,
  ImproveResumeAgent,
  SummarizeResumeAgent
};

// Agent注册表
export const AGENT_REGISTRY = {
  parseResumeAgent: ParseResumeAgent,
  analyzeResumeAgent: AnalyzeResumeAgent,
  improveResumeAgent: ImproveResumeAgent,
  summarizeResumeAgent: SummarizeResumeAgent
};

// Agent信息
export const AGENT_INFO = {
  parseResumeAgent: {
    name: 'Resume Parser',
    description: '解析简历文件为结构化数据',
    capabilities: ['parse', 'validate', 'extract'],
    dependencies: []
  },
  analyzeResumeAgent: {
    name: 'Resume Analyzer',
    description: '分析简历内容和质量',
    capabilities: ['analyze', 'score', 'evaluate'],
    dependencies: ['parseResumeAgent']
  },
  improveResumeAgent: {
    name: 'Resume Improver',
    description: '改进和优化简历内容',
    capabilities: ['improve', 'rewrite', 'enhance', 'add', 'edit'],
    dependencies: ['analyzeResumeAgent']
  },
  summarizeResumeAgent: {
    name: 'Resume Summarizer',
    description: '生成简历摘要和总结',
    capabilities: ['summarize', 'extract', 'format'],
    dependencies: ['parseResumeAgent']
  }
};

// 创建Agent实例的工厂函数
export function createAgent(agentType: string): any {
  const AgentClass = AGENT_REGISTRY[agentType as keyof typeof AGENT_REGISTRY];
  
  if (!AgentClass) {
    throw new Error(`Unknown agent type: ${agentType}`);
  }
  
  return new AgentClass();
}

// 获取所有可用的Agent类型
export function getAvailableAgents(): string[] {
  return Object.keys(AGENT_REGISTRY);
}

// 获取Agent信息
export function getAgentInfo(agentType: string): any {
  return AGENT_INFO[agentType as keyof typeof AGENT_INFO];
}

// 检查Agent依赖
export function checkAgentDependencies(agentType: string): string[] {
  const info = AGENT_INFO[agentType as keyof typeof AGENT_INFO];
  return info?.dependencies || [];
}

// 验证Agent配置
export function validateAgentConfig(agentType: string): boolean {
  const agentClass = AGENT_REGISTRY[agentType as keyof typeof AGENT_REGISTRY];
  const agentInfo = AGENT_INFO[agentType as keyof typeof AGENT_INFO];
  
  return !!(agentClass && agentInfo);
}
