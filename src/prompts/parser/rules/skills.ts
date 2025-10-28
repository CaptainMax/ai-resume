/**
 * 🧠 Domain Layer - 技能解析规则
 * 定义技能section的解析逻辑和字段要求
 */

export const SKILLS_RULES = `
🧩 技能解析规则：
- 技能部分必须统一归类为一个 "Technical Skills" section
- Points只包含技能名（如Java、Spring Boot、AWS、Docker）
- 不得在技能项中加入说明文字
- 技能名称保持原始格式，不要添加额外描述
- 如果技能按类别分组（如Backend、Frontend），每个类别作为独立的field
- 示例：
  "Technical Skills" section:
    - field.name: "Backend", points: ["Java", "Spring Boot", "Docker"]
    - field.name: "Frontend", points: ["React", "Angular"]
`;

export const SKILLS_EXAMPLES = `
📚 技能解析示例：

示例1 - 分类技能：
输入: "Backend: Java, Spring Boot, Docker, AWS. Frontend: React, Angular, TypeScript. Database: MySQL, MongoDB"
输出: {
  "section": "Technical Skills",
  "fields": [
    {
      "name": "Backend",
      "points": ["Java", "Spring Boot", "Docker", "AWS"]
    },
    {
      "name": "Frontend", 
      "points": ["React", "Angular", "TypeScript"]
    },
    {
      "name": "Database",
      "points": ["MySQL", "MongoDB"]
    }
  ]
}

示例2 - 单一技能列表：
输入: "Programming Languages: Java, Python, JavaScript. Frameworks: Spring Boot, React, Django. Tools: Git, Docker, Jenkins"
输出: {
  "section": "Technical Skills",
  "fields": [
    {
      "name": "Programming Languages",
      "points": ["Java", "Python", "JavaScript"]
    },
    {
      "name": "Frameworks",
      "points": ["Spring Boot", "React", "Django"]
    },
    {
      "name": "Tools",
      "points": ["Git", "Docker", "Jenkins"]
    }
  ]
}

示例3 - 简单列表：
输入: "Java, Spring Boot, React, AWS, Docker, MySQL, Git"
输出: {
  "section": "Technical Skills",
  "fields": [
    {
      "name": "Skills",
      "points": ["Java", "Spring Boot", "React", "AWS", "Docker", "MySQL", "Git"]
    }
  ]
}
`;
