/**
 * 🧱 Prompt构建器 - 统一导出buildParserPrompt函数
 * 将各个层级的prompt模块组合成完整的解析prompt
 */

import { BASE_PROMPT } from "./base";
import { SCHEMA_PROMPT } from "./schema";
import { HEADER_RULES, HEADER_EXAMPLES } from "./rules/header";
import { SUMMARY_RULES, SUMMARY_EXAMPLES } from "./rules/summary";
import { WORK_RULES, WORK_EXAMPLES } from "./rules/work";
import { EDUCATION_RULES, EDUCATION_EXAMPLES } from "./rules/education";
import { SKILLS_RULES, SKILLS_EXAMPLES } from "./rules/skills";
import { PROJECTS_RULES, PROJECTS_EXAMPLES } from "./rules/projects";
import { CERTIFICATIONS_RULES, CERTIFICATIONS_EXAMPLES } from "./rules/certifications";
import { LANGUAGES_RULES, LANGUAGES_EXAMPLES } from "./rules/languages";
import { VOLUNTEER_RULES, VOLUNTEER_EXAMPLES } from "./rules/volunteer";
import { PORTFOLIO_RULES, PORTFOLIO_EXAMPLES } from "./rules/portfolio";
import { GENERAL_RULES } from "./rules/general";

/**
 * 构建完整的简历解析Prompt
 * @param options 可选的配置选项
 * @returns 完整的解析prompt字符串
 */
export const buildParserPrompt = (options?: {
  include?: string[];
  exclude?: string[];
  includeExamples?: boolean;
}) => {
  let prompt = BASE_PROMPT + "\n\n" + SCHEMA_PROMPT + "\n\n";

  // 根据选项动态包含规则
  const rules = [
    { name: "header", content: HEADER_RULES, examples: HEADER_EXAMPLES },
    { name: "summary", content: SUMMARY_RULES, examples: SUMMARY_EXAMPLES },
    { name: "work", content: WORK_RULES, examples: WORK_EXAMPLES },
    { name: "education", content: EDUCATION_RULES, examples: EDUCATION_EXAMPLES },
    { name: "skills", content: SKILLS_RULES, examples: SKILLS_EXAMPLES },
    { name: "projects", content: PROJECTS_RULES, examples: PROJECTS_EXAMPLES },
    { name: "certifications", content: CERTIFICATIONS_RULES, examples: CERTIFICATIONS_EXAMPLES },
    { name: "languages", content: LANGUAGES_RULES, examples: LANGUAGES_EXAMPLES },
    { name: "volunteer", content: VOLUNTEER_RULES, examples: VOLUNTEER_EXAMPLES },
    { name: "portfolio", content: PORTFOLIO_RULES, examples: PORTFOLIO_EXAMPLES },
    { name: "general", content: GENERAL_RULES, examples: null },
  ];

  // 应用包含/排除逻辑
  let filteredRules = rules;
  if (options?.include) {
    filteredRules = rules.filter(rule => options.include!.includes(rule.name));
  }
  if (options?.exclude) {
    filteredRules = filteredRules.filter(rule => !options.exclude!.includes(rule.name));
  }

  // 拼接选中的规则
  filteredRules.forEach(rule => {
    prompt += rule.content + "\n\n";
    
    // 如果启用示例且该规则有示例，则添加示例
    if (options?.includeExamples && rule.examples) {
      prompt += rule.examples + "\n\n";
    }
  });

  // 添加最终指令
  prompt += "⚠️ 请直接输出JSON数组，不要添加任何说明文字。";

  return prompt;
};

/**
 * 默认的完整解析prompt（包含所有规则和示例）
 */
export const DEFAULT_PARSER_PROMPT = buildParserPrompt({ includeExamples: true });

/**
 * 简化的解析prompt（仅包含核心规则，无示例）
 */
export const SIMPLE_PARSER_PROMPT = buildParserPrompt({
  include: ["header", "summary", "work", "education", "skills", "general"],
  includeExamples: false
});

/**
 * 学生简历解析prompt（不包含工作经历，包含示例）
 */
export const STUDENT_PARSER_PROMPT = buildParserPrompt({
  exclude: ["work"],
  includeExamples: true
});

/**
 * 完整简历解析prompt（包含所有10个section，无示例）
 */
export const COMPLETE_PARSER_PROMPT = buildParserPrompt({
  include: ["header", "summary", "work", "education", "skills", "projects", "certifications", "languages", "volunteer", "portfolio", "general"],
  includeExamples: false
});

/**
 * 仅规则版本（无示例，适合快速测试）
 */
export const RULES_ONLY_PROMPT = buildParserPrompt({ includeExamples: false });

// 导出所有规则模块，便于单独使用
export {
  BASE_PROMPT,
  SCHEMA_PROMPT,
  HEADER_RULES,
  HEADER_EXAMPLES,
  SUMMARY_RULES,
  SUMMARY_EXAMPLES,
  WORK_RULES,
  WORK_EXAMPLES,
  EDUCATION_RULES,
  EDUCATION_EXAMPLES,
  SKILLS_RULES,
  SKILLS_EXAMPLES,
  PROJECTS_RULES,
  PROJECTS_EXAMPLES,
  CERTIFICATIONS_RULES,
  CERTIFICATIONS_EXAMPLES,
  LANGUAGES_RULES,
  LANGUAGES_EXAMPLES,
  VOLUNTEER_RULES,
  VOLUNTEER_EXAMPLES,
  PORTFOLIO_RULES,
  PORTFOLIO_EXAMPLES,
  GENERAL_RULES,
};
