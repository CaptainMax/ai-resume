/**
 * 🧠 Domain Layer - 工作经历解析规则
 * 定义工作经历section的解析逻辑和字段要求
 */

export const WORK_RULES = `
🎯 工作经历解析特别规则：
- 当遇到 "Apple (Apple Online Store - Onsite-Vendor)" 这种格式时：
  * Company Name的value应该是 "Apple"
  * 职位信息应该作为单独的point，格式为 "Position: Apple Online Store - Onsite-Vendor"
- 当遇到 "Apple Inc." 这种格式时：
  * Company Name的value应该是 "Apple Inc."
- 当遇到 "Apple" 这种格式时：
  * Company Name的value应该是 "Apple"
- 职位信息（如Software Engineer）应该作为 "Position: [职位名称]" 的point
- 时间信息应该作为 "Date: [时间范围]" 的point
- 描述信息应该作为 "Description: [描述内容]" 的point
- 职责信息应该直接作为point内容，不要添加"Responsibility:"前缀

🎯 工作经历解析规则：
- 如果公司名称是 "Apple (Apple Online Store - Onsite-Vendor)"，那么value应该是 "Apple"
- 如果公司名称是 "Apple Inc."，那么value应该是 "Apple Inc."
- 如果公司名称是 "Apple"，那么value应该是 "Apple"
- 公司名称必须从原始文本中准确提取，不能遗漏或截断
- 每个工作经历都要有独立的Company Name field，value字段包含完整公司名称
- 重要：Company Name字段必须有value属性，包含完整的公司名称
- 重要：职责内容应该直接作为point，不要添加"Responsibility:"、"Duty:"、"Task:"等前缀
`;

export const WORK_EXAMPLES = `
📚 工作经历解析示例：

示例1 - 标准格式：
输入: "Software Engineer at Google, Mountain View, CA (2020-2023). Developed scalable web applications using React and Node.js. Led a team of 5 developers."
输出: {
  "section": "Work Experience",
  "fields": [
    {
      "name": "Company Name",
      "value": "Google",
      "points": [
        "Position: Software Engineer",
        "Date: 2020-2023",
        "Location: Mountain View, CA",
        "Description: Developed scalable web applications using React and Node.js",
        "Led a team of 5 developers"
      ]
    }
  ]
}

示例2 - 复杂公司名：
输入: "Apple (Apple Online Store - Onsite-Vendor), Cupertino, CA (Mar. 2022 - Feb. 2025). Participated in all phases of software development lifecycle."
输出: {
  "section": "Work Experience", 
  "fields": [
    {
      "name": "Company Name",
      "value": "Apple",
      "points": [
        "Position: Apple Online Store - Onsite-Vendor",
        "Date: Mar. 2022 - Feb. 2025",
        "Location: Cupertino, CA",
        "Participated in all phases of software development lifecycle"
      ]
    }
  ]
}

示例3 - 多职责：
输入: "Senior Developer at Microsoft, Seattle, WA (2018-2020). Architected microservices. Improved performance by 40%. Mentored junior developers."
输出: {
  "section": "Work Experience",
  "fields": [
    {
      "name": "Company Name", 
      "value": "Microsoft",
      "points": [
        "Position: Senior Developer",
        "Date: 2018-2020",
        "Location: Seattle, WA",
        "Architected microservices",
        "Improved performance by 40%",
        "Mentored junior developers"
      ]
    }
  ]
}
`;
