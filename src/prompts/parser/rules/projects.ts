/**
 * 🧠 Domain Layer - 项目解析规则
 * 定义项目section的解析逻辑和字段要求
 */

export const PROJECTS_RULES = `
💼 项目解析规则：
- 每个项目独立成一个Projects section
- field.name = "Project Name"
- points包含：
  1. Project Description: [项目描述]
  2. Technologies Used: [使用的技术]
  3. Key Achievements: [关键成就]
- 项目名称放在field.name中
- 项目详细信息放在points中
- 示例：
  "Projects" section:
    field.name: "Resume Builder App"
    points: [
      "Project Description: AI-powered resume optimization platform",
      "Technologies Used: React, Node.js, OpenAI API",
      "Key Achievements: Implemented drag-and-drop editor, Integrated AI optimization"
    ]
`;

export const PROJECTS_EXAMPLES = `
📚 项目解析示例：

示例1 - 完整项目：
输入: "E-commerce Platform (2022-2023). Built a full-stack e-commerce platform using React and Node.js. Achieved 99.9% uptime and processed 10K+ orders."
输出: {
  "section": "Projects",
  "fields": [
    {
      "name": "Project Name",
      "value": "E-commerce Platform",
      "points": [
        "Project Description: Built a full-stack e-commerce platform",
        "Technologies Used: React, Node.js",
        "Key Achievements: Achieved 99.9% uptime and processed 10K+ orders",
        "Date: 2022-2023"
      ]
    }
  ]
}

示例2 - 开源项目：
输入: "Open Source Library - DataViz.js. Created a JavaScript library for data visualization. 500+ GitHub stars, used by 50+ companies."
输出: {
  "section": "Projects",
  "fields": [
    {
      "name": "Project Name",
      "value": "DataViz.js",
      "points": [
        "Project Description: Created a JavaScript library for data visualization",
        "Technologies Used: JavaScript, D3.js, Webpack",
        "Key Achievements: 500+ GitHub stars, used by 50+ companies"
      ]
    }
  ]
}

示例3 - 学术项目：
输入: "Machine Learning Research Project. Developed a novel algorithm for image recognition. Published paper in IEEE Conference 2023."
输出: {
  "section": "Projects",
  "fields": [
    {
      "name": "Project Name",
      "value": "Machine Learning Research Project",
      "points": [
        "Project Description: Developed a novel algorithm for image recognition",
        "Technologies Used: Python, TensorFlow, PyTorch",
        "Key Achievements: Published paper in IEEE Conference 2023"
      ]
    }
  ]
}
`;
