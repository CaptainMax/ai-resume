/**
 * 🧠 Domain Layer - 语言能力解析规则
 * 定义Languages section的解析逻辑和字段要求
 */

export const LANGUAGES_RULES = `
🌍 语言能力解析规则：
- Languages section包含语言技能信息
- 字段类型：
  1. 语言名称作为field.name
  2. 熟练度作为field.value（如Native, Fluent, Intermediate, Basic）
- 熟练度等级：
  - Native: 母语
  - Fluent: 流利
  - Advanced: 高级
  - Intermediate: 中级
  - Basic: 基础
- 示例：
  "Languages" section:
    field.name: "English", value: "Native"
    field.name: "Chinese (Mandarin)", value: "Native"
    field.name: "Spanish", value: "Intermediate"
`;

export const LANGUAGES_EXAMPLES = `
📚 语言能力解析示例：

示例1 - 多语言：
输入: "Languages: English (Native), Chinese Mandarin (Native), Spanish (Intermediate), French (Basic)"
输出: {
  "section": "Languages",
  "fields": [
    {
      "name": "English",
      "value": "Native"
    },
    {
      "name": "Chinese (Mandarin)",
      "value": "Native"
    },
    {
      "name": "Spanish",
      "value": "Intermediate"
    },
    {
      "name": "French",
      "value": "Basic"
    }
  ]
}

示例2 - 详细描述：
输入: "English: Native speaker. Japanese: Fluent (JLPT N2 certified). Korean: Intermediate conversational level."
输出: {
  "section": "Languages",
  "fields": [
    {
      "name": "English",
      "value": "Native"
    },
    {
      "name": "Japanese",
      "value": "Fluent (JLPT N2 certified)"
    },
    {
      "name": "Korean",
      "value": "Intermediate"
    }
  ]
}

示例3 - 商务语言：
输入: "English: Native. Spanish: Advanced (Business level). Portuguese: Intermediate. German: Basic."
输出: {
  "section": "Languages",
  "fields": [
    {
      "name": "English",
      "value": "Native"
    },
    {
      "name": "Spanish",
      "value": "Advanced (Business level)"
    },
    {
      "name": "Portuguese",
      "value": "Intermediate"
    },
    {
      "name": "German",
      "value": "Basic"
    }
  ]
}
`;
