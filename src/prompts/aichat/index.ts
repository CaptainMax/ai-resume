/**
 * 🤖 AI Chat Prompts 统一导出
 * 包含所有AI聊天相关的prompt模块
 */

// 基础prompt模块
export * from "./base/latest";

// 功能模块
export * from "./delete/latest";
export * from "./education/latest";
export * from "./rewrite/latest";
export * from "./work/latest";

// 新增的section模块
export * from "./summary/latest";
export * from "./skills/latest";
export * from "./projects/latest";
export * from "./certifications/latest";
export * from "./languages/latest";
export * from "./volunteer/latest";
export * from "./portfolio/latest";

// 类型定义
export interface AIChatPrompt {
  name: string;
  version: string;
  rule: string;
  examples: string[];
}

export interface AIChatModule {
  name: string;
  versions: {
    [version: string]: AIChatPrompt;
  };
  latest: string;
}
