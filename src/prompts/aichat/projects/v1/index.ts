/**
 * 💼 Projects Section Index
 * 项目模块的统一导出
 */

import { PROJECTS_RULE } from "./rule";
import { PROJECTS_EXAMPLES } from "./examples";

export const projectsModule = {
  name: "projects",
  version: "v1",
  rule: PROJECTS_RULE,
  examples: PROJECTS_EXAMPLES,
};

export { PROJECTS_RULE, PROJECTS_EXAMPLES };
export default projectsModule;
