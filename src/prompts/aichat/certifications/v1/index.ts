/**
 * 🏅 Certifications Section Index
 * 证书模块的统一导出
 */

import { CERTIFICATIONS_RULE } from "./rule";
import { CERTIFICATIONS_EXAMPLES } from "./examples";

export const certificationsModule = {
  name: "certifications",
  version: "v1",
  rule: CERTIFICATIONS_RULE,
  examples: CERTIFICATIONS_EXAMPLES,
};

export { CERTIFICATIONS_RULE, CERTIFICATIONS_EXAMPLES };
export default certificationsModule;
