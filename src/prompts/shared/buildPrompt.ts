// TODO (Phase 4): Add automated prompt A/B testing for different versions
// TODO (Phase 4): Log token usage per version for cost comparison

import registry from "./promptRegistry.json";

// 静态导入所有可能的模块
import { BASE_PROMPT } from "@/prompts/aichat/base/v1/rule";
import { BASE_EXAMPLES } from "@/prompts/aichat/base/v1/examples";
import { BASE_PROMPT_V2 } from "@/prompts/aichat/base/v2/rule";
import { BASE_EXAMPLES_V2 } from "@/prompts/aichat/base/v2/examples";

import { EDUCATION_RULE } from "@/prompts/aichat/education/v1/rule";
import { EDUCATION_EXAMPLES } from "@/prompts/aichat/education/v1/examples";
import { EDUCATION_RULE_V2 } from "@/prompts/aichat/education/v2/rule";
import { EDUCATION_EXAMPLES_V2 } from "@/prompts/aichat/education/v2/examples";

import { WORK_RULE } from "@/prompts/aichat/work/v1/rule";
import { WORK_EXAMPLES } from "@/prompts/aichat/work/v1/examples";
import { WORK_RULE_V2 } from "@/prompts/aichat/work/v2/rule";
import { WORK_EXAMPLES_V2 } from "@/prompts/aichat/work/v2/examples";

import { REWRITE_RULE } from "@/prompts/aichat/rewrite/v1/rule";
import { REWRITE_EXAMPLES } from "@/prompts/aichat/rewrite/v1/examples";
import { REWRITE_RULE_V2 } from "@/prompts/aichat/rewrite/v2/rule";
import { REWRITE_EXAMPLES_V2 } from "@/prompts/aichat/rewrite/v2/examples";

import { DELETE_RULE } from "@/prompts/aichat/delete/v1/rule";
import { DELETE_EXAMPLES } from "@/prompts/aichat/delete/v1/examples";
import { DELETE_RULE_V2 } from "@/prompts/aichat/delete/v2/rule";
import { DELETE_EXAMPLES_V2 } from "@/prompts/aichat/delete/v2/examples";

import { CONTEXT_WRAPPER } from "@/prompts/shared/contextWrapper";

export interface PromptContext {
  resume?: any;
  selected?: any;
  resumeStructure?: any[];
}

export interface PromptModule {
  name: string;
  file: string;
  examples?: string;
  always?: boolean;
  trigger?: string[];
  version?: string;
  description?: string;
}

export interface PromptRegistry {
  modules: PromptModule[];
  metadata: {
    version: string;
    lastUpdated: string;
    description: string;
  };
}

// 模块映射对象 - 静态导入的内容
const MODULE_MAP = {
  base: {
    v1: { rule: BASE_PROMPT, examples: BASE_EXAMPLES },
    v2: { rule: BASE_PROMPT_V2, examples: BASE_EXAMPLES_V2 }
  },
  education: {
    v1: { rule: EDUCATION_RULE, examples: EDUCATION_EXAMPLES },
    v2: { rule: EDUCATION_RULE_V2, examples: EDUCATION_EXAMPLES_V2 }
  },
  work: {
    v1: { rule: WORK_RULE, examples: WORK_EXAMPLES },
    v2: { rule: WORK_RULE_V2, examples: WORK_EXAMPLES_V2 }
  },
  rewrite: {
    v1: { rule: REWRITE_RULE, examples: REWRITE_EXAMPLES },
    v2: { rule: REWRITE_RULE_V2, examples: REWRITE_EXAMPLES_V2 }
  },
  delete: {
    v1: { rule: DELETE_RULE, examples: DELETE_EXAMPLES },
    v2: { rule: DELETE_RULE_V2, examples: DELETE_EXAMPLES_V2 }
  },
  context: {
    v1: { rule: CONTEXT_WRAPPER, examples: null }
  }
};

export async function buildPrompt(
  message: string, 
  context?: PromptContext, 
  forceVersion?: string
): Promise<string> {
  console.log("🔧 开始构建Prompt，消息:", message.substring(0, 50) + "...");
  
  let prompt = "";
  const loadedModules: string[] = [];

  // 动态加载模块
  for (const module of registry.modules) {
    // 判断是否启用该模块
    const shouldLoad = 
      module.always || 
      (module.trigger && 
        module.trigger.some((word) => 
          message.toLowerCase().includes(word.toLowerCase())
        )
      );

    if (shouldLoad) {
      try {
        // 获取版本号
        const version = forceVersion || module.version || "v1";
        
        // 从静态映射中获取模块内容
        const moduleContent = MODULE_MAP[module.name as keyof typeof MODULE_MAP];
        if (!moduleContent) {
          console.warn(`⚠️ 模块未找到: ${module.name}`);
          continue;
        }
        
        const versionContent = moduleContent[version as keyof typeof moduleContent];
        if (!versionContent) {
          console.warn(`⚠️ 版本未找到: ${module.name}(${version})`);
          continue;
        }

        // 1. 加载模块规则
        if (versionContent.rule) {
          prompt += `\n\n${versionContent.rule}`;
          console.log(`✅ 加载规则: ${module.name}(${version}) - ${module.description}`);
        }

        // 2. 加载Few-shot示例（如果配置了）
        if (versionContent.examples) {
          prompt += `\n\n${versionContent.examples}`;
          console.log(`📚 加载示例: ${module.name}(${version}) - Few-shot examples`);
        }

        loadedModules.push(`${module.name}(${version})`);
      } catch (error) {
        console.error(`❌ 加载模块失败: ${module.name}`, error);
      }
    } else {
      console.log(`⏭️ 跳过模块: ${module.name} - 不满足加载条件`);
    }
  }

  // 添加上下文信息
  if (context) {
    try {
      const { CONTEXT_WRAPPER } = await import("./contextWrapper");
      prompt += CONTEXT_WRAPPER.replace("{{context}}", JSON.stringify(context, null, 2));
      loadedModules.push("context");
      console.log("✅ 添加上下文信息");
    } catch (error) {
      console.error("❌ 添加上下文失败:", error);
    }
  }

  console.log(`📦 已加载模块: [${loadedModules.join(", ")}]`);
  console.log(`📊 最终Prompt长度: ${prompt.length} 字符`);

  return prompt;
}
