/**
 * 🧠 Domain Layer - 作品集/出版物解析规则
 * 定义Portfolio/Publications section的解析逻辑和字段要求
 */

export const PORTFOLIO_RULES = `
💼 作品集/出版物解析规则：
- Portfolio/Publications section包含作品集链接和出版物
- 字段类型：
  1. 作品集类型作为field.name（如GitHub Portfolio, Personal Website）
  2. 链接作为field.value
  3. 出版物作为field.name，详细信息作为points
- 作品集字段：
  - GitHub Portfolio: GitHub链接
  - Personal Website: 个人网站链接
  - LinkedIn: LinkedIn链接
- 出版物字段：
  - Publications: 出版物列表
  - Research Papers: 研究论文
  - Blog Posts: 博客文章
- 示例：
  "Portfolio/Publications" section:
    field.name: "GitHub Portfolio", value: "https://github.com/username"
    field.name: "Publications", points: ["Paper Title, Conference 2023"]
`;

export const PORTFOLIO_EXAMPLES = `
📚 作品集/出版物解析示例：

示例1 - 作品集链接：
输入: "GitHub: https://github.com/johndoe. Personal Website: https://johndoe.dev. LinkedIn: linkedin.com/in/johndoe"
输出: {
  "section": "Portfolio/Publications",
  "fields": [
    {
      "name": "GitHub Portfolio",
      "value": "https://github.com/johndoe"
    },
    {
      "name": "Personal Website",
      "value": "https://johndoe.dev"
    },
    {
      "name": "LinkedIn",
      "value": "linkedin.com/in/johndoe"
    }
  ]
}

示例2 - 出版物：
输入: "Publications: 'Machine Learning in Resume Optimization' (IEEE Conference 2023). 'Scalable Backend Architecture Patterns' (Medium Article 2022). Blog: techinsights.blog"
输出: {
  "section": "Portfolio/Publications",
  "fields": [
    {
      "name": "Publications",
      "points": [
        "Machine Learning in Resume Optimization, IEEE Conference 2023",
        "Scalable Backend Architecture Patterns, Medium Article 2022"
      ]
    },
    {
      "name": "Blog",
      "value": "techinsights.blog"
    }
  ]
}

示例3 - 完整作品集：
输入: "Portfolio: https://alexsmith.dev. GitHub: github.com/alexsmith. Publications: 'AI Ethics in Software Development' (ACM Journal 2023). Research: 'Quantum Computing Applications' (Nature 2022)"
输出: {
  "section": "Portfolio/Publications",
  "fields": [
    {
      "name": "Portfolio",
      "value": "https://alexsmith.dev"
    },
    {
      "name": "GitHub",
      "value": "github.com/alexsmith"
    },
    {
      "name": "Publications",
      "points": [
        "AI Ethics in Software Development, ACM Journal 2023",
        "Quantum Computing Applications, Nature 2022"
      ]
    }
  ]
}
`;
