/**
 * 🧠 Domain Layer - 个人简介解析规则
 * 定义Summary section的解析逻辑和字段要求
 */

export const SUMMARY_RULES = `
📝 个人简介解析规则：
- Summary section包含个人职业概述
- 字段类型：
  1. Summary: 个人简介/职业概述
  2. Objective: 职业目标
  3. Professional Summary: 专业总结
- 支持两种结构：
  1. 简单结构：使用value属性存储完整的简介文本
  2. 详细结构：使用points数组分解关键信息点
- 简介应包含：经验年限、专业领域、核心技能、职业目标
- 示例：
  "Summary" section:
    field.name: "Summary", value: "Backend developer with 4+ years of experience building scalable systems."
    或
    field.name: "Summary", points: ["4+ years backend development", "Expertise in Java and Spring Boot", "Led team of 5 developers"]
`;

export const SUMMARY_EXAMPLES = `
📚 个人简介解析示例：

示例1 - 简单结构（value）：
输入: "Experienced software engineer with 5+ years developing scalable web applications using Java, Spring Boot, and AWS. Passionate about building efficient systems and leading technical teams."
输出: {
  "section": "Summary",
  "fields": [
    {
      "name": "Summary",
      "value": "Experienced software engineer with 5+ years developing scalable web applications using Java, Spring Boot, and AWS. Passionate about building efficient systems and leading technical teams."
    }
  ]
}

示例2 - 详细结构（points）：
输入: "Software Engineer with 5+ years experience. Expertise in Java, Spring Boot, AWS. Led development of scalable systems. Strong background in agile methodologies."
输出: {
  "section": "Summary",
  "fields": [
    {
      "name": "Summary",
      "points": [
        "5+ years software engineering experience",
        "Expertise in Java, Spring Boot, and AWS",
        "Led development of scalable systems",
        "Strong background in agile methodologies"
      ]
    }
  ]
}

示例3 - 职业目标：
输入: "Objective: Seeking a Senior Software Engineer position at a technology company where I can leverage my expertise in full-stack development and cloud architecture to drive innovation."
输出: {
  "section": "Summary",
  "fields": [
    {
      "name": "Objective",
      "value": "Seeking a Senior Software Engineer position at a technology company where I can leverage my expertise in full-stack development and cloud architecture to drive innovation."
    }
  ]
}
`;
