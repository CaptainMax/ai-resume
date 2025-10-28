/**
 * 🧠 Domain Layer - 头部信息解析规则
 * 定义Header section的解析逻辑和字段要求
 */

export const HEADER_RULES = `
📋 头部信息解析规则：
- Header section包含个人基本信息
- 字段类型：
  1. Full Name: 完整姓名
  2. Phone: 电话号码
  3. Email: 邮箱地址
  4. Portfolio: 个人网站/作品集链接
  5. LinkedIn: LinkedIn链接
  6. Location: 地理位置
- 所有字段使用value属性存储信息
- 示例：
  "Header" section:
    field.name: "Full Name", value: "Jian Ma"
    field.name: "Email", value: "jian@example.com"
`;

export const HEADER_EXAMPLES = `
📚 头部信息解析示例：

示例1 - 标准格式：
输入: "Jian Ma, Software Engineer. Email: jian.ma@example.com. Phone: (555) 123-4567. Location: San Francisco, CA"
输出: {
  "section": "Header",
  "fields": [
    {
      "name": "Full Name",
      "value": "Jian Ma"
    },
    {
      "name": "Email",
      "value": "jian.ma@example.com"
    },
    {
      "name": "Phone",
      "value": "(555) 123-4567"
    },
    {
      "name": "Location",
      "value": "San Francisco, CA"
    }
  ]
}

示例2 - 包含作品集：
输入: "Sarah Johnson, Full Stack Developer. Email: sarah@tech.com. Portfolio: https://sarahjohnson.dev. LinkedIn: linkedin.com/in/sarahjohnson"
输出: {
  "section": "Header",
  "fields": [
    {
      "name": "Full Name",
      "value": "Sarah Johnson"
    },
    {
      "name": "Email",
      "value": "sarah@tech.com"
    },
    {
      "name": "Portfolio",
      "value": "https://sarahjohnson.dev"
    },
    {
      "name": "LinkedIn",
      "value": "linkedin.com/in/sarahjohnson"
    }
  ]
}

示例3 - 完整信息：
输入: "Michael Chen, Senior Software Engineer. Email: michael.chen@company.com. Phone: +1 (555) 987-6543. Location: Seattle, WA. Website: michaelchen.dev"
输出: {
  "section": "Header",
  "fields": [
    {
      "name": "Full Name",
      "value": "Michael Chen"
    },
    {
      "name": "Email",
      "value": "michael.chen@company.com"
    },
    {
      "name": "Phone",
      "value": "+1 (555) 987-6543"
    },
    {
      "name": "Location",
      "value": "Seattle, WA"
    },
    {
      "name": "Portfolio",
      "value": "michaelchen.dev"
    }
  ]
}
`;
