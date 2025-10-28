/**
 * 🤝 Volunteer Section Index
 * 志愿者模块的统一导出
 */

import { VOLUNTEER_RULE } from "./rule";
import { VOLUNTEER_EXAMPLES } from "./examples";

export const volunteerModule = {
  name: "volunteer",
  version: "v1",
  rule: VOLUNTEER_RULE,
  examples: VOLUNTEER_EXAMPLES,
};

export { VOLUNTEER_RULE, VOLUNTEER_EXAMPLES };
export default volunteerModule;
