/**
 * 🧱 Schema Layer - 输出结构与JSON约束
 * 定义标准化的JSON输出格式和数据结构要求
 */

export const SCHEMA_PROMPT = `
📊 输出格式要求：

REQUIRED JSON FORMAT (MUST BE AN ARRAY):
[
  {
    "section": "Header",
    "fields": [
      { "name": "Email", "points": ["max.jian.ma@gmail.com"] },
      { "name": "Phone No", "points": ["214-796-0666"] },
      { "name": "Web", "points": ["http://maxonboard.com"] }
    ]
  },
  {
    "section": "Work Experience",
    "fields": [
      { 
        "name": "Company Name", 
        "value": "eBay",
        "points": [
          "Location: Austin, TX",
          "Date: Aug 2024 to Current",
          "Project: eBay Migration Project",
          "Description: Worked on eBay's API migration initiative...",
          "Responsibility: Migrated eBay's legacy APIs to new RESTful APIs",
          "Responsibility: Developed, tested, and deployed new API integrations",
          "Responsibility: Optimized API performance and improved data exchange efficiency"
        ]
      }
    ]
  },
  {
    "section": "Work Experience",
    "fields": [
      { 
        "name": "Company Name", 
        "value": "Apple",
        "points": [
          "Position: Apple Online Store - Onsite-Vendor",
          "Date: Mar. 2022 - Feb. 2025",
          "Description: Apple's online store is a premier destination for purchasing a wide range of Apple products and accessories. It provides easy navigation, detailed product info, and secure shopping. Customers enjoy fast, free shipping, AppleCare support, and a user-friendly interface for a seamless, convenient shopping experience.",
          "Responsibility: Participated in all phases of the software development lifecycle, including analysis, design, development, integration, and testing.",
          "Responsibility: Revamped the interaction service by incorporating a thread pool, significantly improving its performance. This enhancement increased upload speeds by 90%, resulting in faster data transfers and a more efficient system overall."
        ]
      }
    ]
  },
  {
    "section": "Education",
    "fields": [
      { 
        "name": "University Name", 
        "value": "The University of Texas at Arlington",
        "points": [
          "Location: Arlington, TX",
          "Date: Sep. 2017 - Dec. 2020",
          "Degree: B.S. Computer Science"
        ]
      }
    ]
  },
  {
    "section": "Technical Skills",
    "fields": [
      { "name": "Skills", "points": ["Java", "Spring Boot", "AWS", "Kubernetes", "Docker"] }
    ]
  },
  {
    "section": "Projects",
    "fields": [
      { "name": "Project Name", "points": ["Project Description", "Technologies Used", "Key Achievements"] }
    ]
  }
]

⚠️ 重要约束：
- 输出必须以 [ 开始，以 ] 结束
- 每个工作经历都要完整提取所有信息
- 每个职责点都要单独列出
- 不要遗漏任何内容
- Company Name和University Name字段的value属性是必须的，不能为空或null！
- 请直接输出 JSON 数组，不要添加任何说明文字。
`;
