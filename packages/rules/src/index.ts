export { architectureRules } from "./architecture/index.js";
export { ARCH001 } from "./architecture/ARCH-001.js";
export { ARCH002 } from "./architecture/ARCH-002.js";
export { ARCH003 } from "./architecture/ARCH-003.js";
export { ARCH004 } from "./architecture/ARCH-004.js";

export { apiRules } from "./api/index.js";
export { API001 } from "./api/API-001.js";
export { API002 } from "./api/API-002.js";
export { API003 } from "./api/API-003.js";
export { API004 } from "./api/API-004.js";

export { testingRules } from "./testing/index.js";
export { TEST001 } from "./testing/TEST-001.js";
export { TEST002 } from "./testing/TEST-002.js";
export { TEST003 } from "./testing/TEST-003.js";
export { TEST004 } from "./testing/TEST-004.js";

export { securityRules } from "./security/index.js";
export { SEC001 } from "./security/SEC-001.js";
export { SEC002 } from "./security/SEC-002.js";
export { SEC003 } from "./security/SEC-003.js";

export { namingRules } from "./naming/index.js";
export { NAME001 } from "./naming/NAME-001.js";
export { NAME002 } from "./naming/NAME-002.js";
export { NAME003 } from "./naming/NAME-003.js";

import { architectureRules } from "./architecture/index.js";
import { apiRules } from "./api/index.js";
import { testingRules } from "./testing/index.js";
import { securityRules } from "./security/index.js";
import { namingRules } from "./naming/index.js";
import type { Rule } from "@archstandards/core";

/**
 * All 18 built-in rules across all categories.
 */
export const allRules: readonly Rule[] = [
  ...architectureRules,
  ...apiRules,
  ...testingRules,
  ...securityRules,
  ...namingRules,
];
