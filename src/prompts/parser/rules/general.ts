/**
 * 🧠 Domain Layer - 通用辅助规则
 * 定义非特定section的通用解析规则
 */

export const GENERAL_RULES = `
⚙️ 通用规则：
- 所有section的title必须首字母大写
- 不得遗漏Header, Work Experience, Education, Technical Skills, Projects, Certifications等主要部分
- 若部分信息缺失，保留空结构
- 最终输出仅包含JSON，无额外解释
- 确保所有字段名使用标准格式：
  * Company Name（工作经历）
  * University Name（教育背景）
  * Project Name（项目经历）
  * Skills（技能）
- 时间格式统一使用标准格式（如：Mar. 2022 - Feb. 2025）
- 地点格式统一使用标准格式（如：Austin, TX）
- 学位格式统一使用标准格式（如：B.S. Computer Science）
`;
