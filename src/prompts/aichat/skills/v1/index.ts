/**
 * 🧩 Skills Section Index
 * 技能模块的统一导出
 */

import { SKILLS_RULE } from "./rule";
import { SKILLS_EXAMPLES } from "./examples";

export const skillsModule = {
  name: "skills",
  version: "v1",
  rule: SKILLS_RULE,
  examples: SKILLS_EXAMPLES,
};

export { SKILLS_RULE, SKILLS_EXAMPLES };
export default skillsModule;
