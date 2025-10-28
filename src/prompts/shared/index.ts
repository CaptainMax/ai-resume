/**
 * 🔧 Shared Prompts 工具
 * 包含所有共享的prompt工具和配置
 */

// 核心工具
export * from "./buildPrompt";
export * from "./contextWrapper";
export * from "./extractJson";

// 配置和文档
export { default as promptRegistry } from "./promptRegistry.json";

// 类型定义
export interface SharedPromptConfig {
  registryPath: string;
  versionControl: boolean;
  enableMetrics: boolean;
}

export interface PromptMetrics {
  tokenCount: number;
  cost: number;
  responseTime: number;
  quality: number;
}
