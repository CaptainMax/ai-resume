/**
 * 💼 Portfolio Section Index
 * 作品集模块的统一导出
 */

import { PORTFOLIO_RULE } from "./rule";
import { PORTFOLIO_EXAMPLES } from "./examples";

export const portfolioModule = {
  name: "portfolio",
  version: "v1",
  rule: PORTFOLIO_RULE,
  examples: PORTFOLIO_EXAMPLES,
};

export { PORTFOLIO_RULE, PORTFOLIO_EXAMPLES };
export default portfolioModule;
