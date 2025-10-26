// src/app/agents/agentRegistry.ts
// 🎯 动态 Agent Registry - 智能可扩展的 Agent 管理系统

import { IAgent, AgentExecutionResult } from './base/IAgent';
import { ParseResumeAgent } from './parseResumeAgent';
import { AnalyzeResumeAgent } from './analyzeResumeAgent';
import { ImproveResumeAgent } from './improveResumeAgent';
import { SummarizeResumeAgent } from './summarizeResumeAgent';
import { ResumeModifierAgent } from './resumeModifierAgent';

// 🎯 动态 Agent Registry
export const agentRegistry: Record<string, IAgent> = {
  parseResumeAgent: new ParseResumeAgent(),
  analyzeResumeAgent: new AnalyzeResumeAgent(),
  improveResumeAgent: new ImproveResumeAgent(),
  summarizeResumeAgent: new SummarizeResumeAgent(),
  resumeModifierAgent: new ResumeModifierAgent()
};

/**
 * 🎯 获取所有可用 Agent
 */
export function getAvailableAgents(): IAgent[] {
  return Object.values(agentRegistry).filter(agent => agent.status === 'available');
}

/**
 * 🎯 根据能力查找 Agent
 */
export function findAgentByCapability(capability: string): IAgent | null {
  return Object.values(agentRegistry).find(agent => 
    agent.status === 'available' && agent.capabilities.includes(capability)
  ) || null;
}

/**
 * 🎯 根据多个能力查找最佳 Agent
 */
export function findBestAgentByCapabilities(capabilities: string[]): IAgent | null {
  const availableAgents = getAvailableAgents();
  
  // 找到能处理所有能力的 Agent
  const perfectMatch = availableAgents.find(agent => 
    capabilities.every(cap => agent.capabilities.includes(cap))
  );
  
  if (perfectMatch) return perfectMatch;
  
  // 找到能处理最多能力的 Agent
  const bestMatch = availableAgents.reduce((best, current) => {
    const currentScore = capabilities.filter(cap => current.capabilities.includes(cap)).length;
    const bestScore = capabilities.filter(cap => best.capabilities.includes(cap)).length;
    return currentScore > bestScore ? current : best;
  });
  
  return bestMatch;
}

/**
 * 🎯 根据 ID 获取 Agent
 */
export function getAgentById(id: string): IAgent | null {
  return agentRegistry[id] || null;
}

/**
 * 🎯 注册新 Agent
 */
export function registerAgent(agent: IAgent): void {
  agentRegistry[agent.id] = agent;
  console.log(`✅ Agent 注册成功: ${agent.id} (${agent.name})`);
}

/**
 * 🎯 注销 Agent
 */
export function unregisterAgent(id: string): boolean {
  if (agentRegistry[id]) {
    delete agentRegistry[id];
    console.log(`🗑️ Agent 注销成功: ${id}`);
    return true;
  }
  return false;
}

/**
 * 🎯 更新 Agent 状态
 */
export function updateAgentStatus(id: string, status: IAgent['status']): boolean {
  const agent = agentRegistry[id];
  if (agent) {
    agent.status = status;
    console.log(`🔄 Agent 状态更新: ${id} -> ${status}`);
    return true;
  }
  return false;
}

/**
 * 🎯 获取 Agent 统计信息
 */
export function getAgentStats(): {
  total: number;
  available: number;
  busy: number;
  disabled: number;
  capabilities: Record<string, number>;
} {
  const agents = Object.values(agentRegistry);
  const stats = {
    total: agents.length,
    available: agents.filter(a => a.status === 'available').length,
    busy: agents.filter(a => a.status === 'busy').length,
    disabled: agents.filter(a => a.status === 'disabled').length,
    capabilities: {} as Record<string, number>
  };
  
  // 统计能力分布
  agents.forEach(agent => {
    agent.capabilities.forEach(cap => {
      stats.capabilities[cap] = (stats.capabilities[cap] || 0) + 1;
    });
  });
  
  return stats;
}

/**
 * 🎯 健康检查所有 Agent
 */
export async function healthCheckAllAgents(): Promise<Record<string, boolean>> {
  const results: Record<string, boolean> = {};
  
  for (const [id, agent] of Object.entries(agentRegistry)) {
    try {
      if (agent.healthCheck) {
        results[id] = await agent.healthCheck();
      } else {
        results[id] = true; // 默认健康
      }
    } catch (error) {
      console.error(`❌ Agent ${id} 健康检查失败:`, error);
      results[id] = false;
    }
  }
  
  return results;
}

/**
 * 🎯 根据任务类型智能选择 Agent
 */
export function selectAgentForTask(taskType: string, requiredCapabilities: string[] = []): IAgent | null {
  console.log(`🎯 为任务选择 Agent: ${taskType}, 需要能力: ${requiredCapabilities.join(', ')}`);
  
  // 1. 优先根据任务类型匹配
  const taskTypeMapping: Record<string, string[]> = {
    'add_work_experience': ['add', 'modify'],
    'add_education': ['add', 'modify'],
    'add_skill': ['add', 'modify'],
    'edit_work_experience': ['edit', 'modify'],
    'delete_work_experience': ['remove', 'modify'],
    'optimize_content': ['optimize', 'improve'],
    'parse_resume': ['parse', 'extract'],
    'analyze_resume': ['analyze', 'evaluate'],
    'improve_resume': ['improve', 'enhance']
  };
  
  const taskCapabilities = taskTypeMapping[taskType] || [taskType];
  const allCapabilities = [...taskCapabilities, ...requiredCapabilities];
  
  // 2. 查找最佳匹配
  const selectedAgent = findBestAgentByCapabilities(allCapabilities);
  
  if (selectedAgent) {
    console.log(`✅ 选择 Agent: ${selectedAgent.id} (${selectedAgent.name})`);
    console.log(`🎯 Agent 能力: ${selectedAgent.capabilities.join(', ')}`);
  } else {
    console.log(`❌ 未找到合适的 Agent 处理任务: ${taskType}`);
  }
  
  return selectedAgent;
}

/**
 * 🎯 执行任务（智能路由）
 */
export async function executeTask(taskType: string, taskData: any, requiredCapabilities: string[] = []): Promise<AgentExecutionResult> {
  const agent = selectAgentForTask(taskType, requiredCapabilities);
  
  if (!agent) {
    return {
      success: false,
      error: `No available agent found for task: ${taskType}`,
      executionTime: 0
    };
  }
  
  try {
    console.log(`🚀 执行任务: ${taskType} 使用 Agent: ${agent.id}`);
    const startTime = Date.now();
    
    // 更新状态为忙碌
    updateAgentStatus(agent.id, 'busy');
    
    const result = await agent.execute(taskData);
    const executionTime = Date.now() - startTime;
    
    // 恢复状态为可用
    updateAgentStatus(agent.id, 'available');
    
    return {
      success: true,
      data: result,
      executionTime,
      metadata: {
        agentId: agent.id,
        timestamp: new Date(),
        parameters: taskData
      }
    };
  } catch (error) {
    // 恢复状态为可用
    updateAgentStatus(agent.id, 'available');
    
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      executionTime: 0,
      metadata: {
        agentId: agent.id,
        timestamp: new Date(),
        parameters: taskData
      }
    };
  }
}

// 🎯 导出兼容性函数（保持与旧系统兼容）
export function getAvailableAgentsList(): string[] {
  return getAvailableAgents().map(agent => agent.id);
}

export function createAgent(agentType: string): IAgent | null {
  return getAgentById(agentType);
}
