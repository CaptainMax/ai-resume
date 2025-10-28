/**
 * 📝 Summary Section Index
 * 个人简介模块的统一导出
 */

import { SUMMARY_RULE } from "./rule";
import { SUMMARY_EXAMPLES } from "./examples";

export const summaryModule = {
  name: "summary",
  version: "v1",
  rule: SUMMARY_RULE,
  examples: SUMMARY_EXAMPLES,
};

export { SUMMARY_RULE, SUMMARY_EXAMPLES };
export default summaryModule;
