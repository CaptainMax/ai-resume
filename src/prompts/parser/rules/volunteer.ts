/**
 * 🧠 Domain Layer - 志愿者/领导经验解析规则
 * 定义Volunteer/Leadership section的解析逻辑和字段要求
 */

export const VOLUNTEER_RULES = `
🤝 志愿者/领导经验解析规则：
- Volunteer/Leadership section包含志愿者工作和领导经验
- 字段类型：
  1. 组织/活动名称作为field.name
  2. 详细信息作为points数组
- Points包含：
  1. Organization: [组织名称]
  2. Duration: [时间范围]
  3. Role: [角色/职位]
  4. Description: [描述/成就]
- 示例：
  "Volunteer/Leadership" section:
    field.name: "Tech for Good Volunteer"
    points: [
      "Organization: Code for America",
      "Duration: 2022 - Present",
      "Role: Lead Developer for civic tech projects"
    ]
`;

export const VOLUNTEER_EXAMPLES = `
📚 志愿者/领导经验解析示例：

示例1 - 志愿者工作：
输入: "Volunteer Developer at Code for America (2022-Present). Led development of civic tech projects. Mentored junior developers and organized coding workshops."
输出: {
  "section": "Volunteer/Leadership",
  "fields": [
    {
      "name": "Code for America Volunteer",
      "points": [
        "Organization: Code for America",
        "Duration: 2022 - Present",
        "Role: Volunteer Developer",
        "Description: Led development of civic tech projects",
        "Achievement: Mentored junior developers and organized coding workshops"
      ]
    }
  ]
}

示例2 - 领导经验：
输入: "President of University Coding Club (2018-2020). Led 50+ members in coding competitions. Organized hackathons and tech talks."
输出: {
  "section": "Volunteer/Leadership",
  "fields": [
    {
      "name": "University Coding Club President",
      "points": [
        "Organization: University Coding Club",
        "Duration: 2018 - 2020",
        "Role: President",
        "Description: Led 50+ members in coding competitions",
        "Achievement: Organized hackathons and tech talks"
      ]
    }
  ]
}

示例3 - 多个志愿者经历：
输入: "Open Source Contributor (2021-Present): Contributed to React and Node.js projects. Community Volunteer (2020-2021): Taught coding to underprivileged youth."
输出: {
  "section": "Volunteer/Leadership",
  "fields": [
    {
      "name": "Open Source Contributor",
      "points": [
        "Duration: 2021 - Present",
        "Description: Contributed to React and Node.js projects"
      ]
    },
    {
      "name": "Community Volunteer",
      "points": [
        "Duration: 2020 - 2021",
        "Description: Taught coding to underprivileged youth"
      ]
    }
  ]
}
`;
