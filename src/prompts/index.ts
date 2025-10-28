/**
 * 🧱 Prompts 统一导出入口
 * 重新组织后的prompts文件夹结构
 */

// Parser相关导出
export * from "./parser";

// AI Chat相关导出
export * from "./aichat";

// 共享工具导出
export * from "./shared/buildPrompt";
export * from "./shared/contextWrapper";
export * from "./shared/extractJson";

// 类型定义
export interface PromptModule {
  name: string;
  version: string;
  path: string;
  description: string;
}

export interface PromptRegistry {
  modules: PromptModule[];
  lastUpdated: string;
}