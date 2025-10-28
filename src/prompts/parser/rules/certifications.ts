/**
 * 🧠 Domain Layer - 证书与奖项解析规则
 * 定义证书和奖项section的解析逻辑和字段要求
 */

export const CERTIFICATIONS_RULES = `
🏅 证书与奖项解析规则：
- 每个证书或奖项作为一个字段
- field.name = 证书名称，points列出颁发时间或ID
- 证书信息包括：
  1. Issued: [颁发时间]
  2. Credential ID: [证书ID]（如果有）
  3. Valid until: [有效期]（如果有）
- 示例：
  "Certifications/Awards" section:
    field.name: "AWS Certified Solutions Architect"
    points: [
      "Issued: 2023",
      "Credential ID: AWS-CSA-123456"
    ]
    field.name: "Google Cloud Professional Developer"
    points: [
      "Issued: 2022",
      "Valid until: 2025"
    ]
`;

export const CERTIFICATIONS_EXAMPLES = `
📚 证书与奖项解析示例：

示例1 - AWS证书：
输入: "AWS Certified Solutions Architect - Professional (2023). Credential ID: AWS-CSA-PRO-123456. Valid until 2026."
输出: {
  "section": "Certifications/Awards",
  "fields": [
    {
      "name": "AWS Certified Solutions Architect - Professional",
      "points": [
        "Issued: 2023",
        "Credential ID: AWS-CSA-PRO-123456",
        "Valid until: 2026"
      ]
    }
  ]
}

示例2 - 多个证书：
输入: "Google Cloud Professional Developer (2022), Microsoft Azure Solutions Architect (2021), Kubernetes Administrator (2023)"
输出: {
  "section": "Certifications/Awards",
  "fields": [
    {
      "name": "Google Cloud Professional Developer",
      "points": ["Issued: 2022"]
    },
    {
      "name": "Microsoft Azure Solutions Architect",
      "points": ["Issued: 2021"]
    },
    {
      "name": "Kubernetes Administrator",
      "points": ["Issued: 2023"]
    }
  ]
}

示例3 - 奖项：
输入: "Employee of the Year 2023 - TechCorp. Outstanding Performance Award 2022 - Innovation Inc."
输出: {
  "section": "Certifications/Awards",
  "fields": [
    {
      "name": "Employee of the Year",
      "points": [
        "Issued: 2023",
        "Organization: TechCorp"
      ]
    },
    {
      "name": "Outstanding Performance Award",
      "points": [
        "Issued: 2022",
        "Organization: Innovation Inc."
      ]
    }
  ]
}
`;
