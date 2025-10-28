/**
 * 🧠 Domain Layer - 教育背景解析规则
 * 定义教育section的解析逻辑和字段要求
 */

export const EDUCATION_RULES = `
🎓 教育背景解析规则：
- 如果大学名称是 "The University of Texas at Arlington"，那么University Name的value应该是 "The University of Texas at Arlington"
- 如果大学名称是 "MIT"，那么University Name的value应该是 "MIT"
- 如果大学名称是 "Stanford University"，那么University Name的value应该是 "Stanford University"
- 大学名称必须从原始文本中准确提取，不能遗漏或截断
- University Name字段的value属性是必须的，不能为空或null！

🎓 教育背景字段要求：
- University Name的value必须是完整校名
- Points包含：
  1. Location: [地点]
  2. Date: [时间范围]
  3. Degree: [学位信息]
- 示例：
  "University Name": "The University of Texas at Arlington"
  "Points": ["Location: Arlington, TX", "Date: Sep. 2017 - Dec. 2020", "Degree: B.S. Computer Science"]
`;

export const EDUCATION_EXAMPLES = `
📚 教育背景解析示例：

示例1 - 标准格式：
输入: "Bachelor of Science in Computer Science, The University of Texas at Arlington, Arlington, TX (2017-2020). GPA: 3.8"
输出: {
  "section": "Education",
  "fields": [
    {
      "name": "University Name",
      "value": "The University of Texas at Arlington",
      "points": [
        "Location: Arlington, TX",
        "Date: 2017-2020",
        "Degree: B.S. Computer Science",
        "GPA: 3.8"
      ]
    }
  ]
}

示例2 - 研究生学位：
输入: "Master of Science in Computer Science, Massachusetts Institute of Technology, Cambridge, MA (2023-2025). Focus: Machine Learning"
输出: {
  "section": "Education",
  "fields": [
    {
      "name": "University Name",
      "value": "Massachusetts Institute of Technology",
      "points": [
        "Location: Cambridge, MA",
        "Date: 2023-2025",
        "Degree: M.S. Computer Science",
        "Focus: Machine Learning"
      ]
    }
  ]
}

示例3 - 多学位：
输入: "PhD in Artificial Intelligence, Stanford University, Stanford, CA (2020-2023). Dissertation: Deep Learning Applications"
输出: {
  "section": "Education",
  "fields": [
    {
      "name": "University Name",
      "value": "Stanford University",
      "points": [
        "Location: Stanford, CA",
        "Date: 2020-2023",
        "Degree: PhD in Artificial Intelligence",
        "Dissertation: Deep Learning Applications"
      ]
    }
  ]
}
`;
