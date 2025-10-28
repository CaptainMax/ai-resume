/**
 * 🌍 Languages Section Index
 * 语言能力模块的统一导出
 */

import { LANGUAGES_RULE } from "./rule";
import { LANGUAGES_EXAMPLES } from "./examples";

export const languagesModule = {
  name: "languages",
  version: "v1",
  rule: LANGUAGES_RULE,
  examples: LANGUAGES_EXAMPLES,
};

export { LANGUAGES_RULE, LANGUAGES_EXAMPLES };
export default languagesModule;
