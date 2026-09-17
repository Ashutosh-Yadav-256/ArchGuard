export { TEST001 } from "./TEST-001.js";
export { TEST002 } from "./TEST-002.js";
export { TEST003 } from "./TEST-003.js";
export { TEST004 } from "./TEST-004.js";

import { TEST001 } from "./TEST-001.js";
import { TEST002 } from "./TEST-002.js";
import { TEST003 } from "./TEST-003.js";
import { TEST004 } from "./TEST-004.js";
import type { Rule } from "@archstandards/core";

export const testingRules: readonly Rule[] = [TEST001, TEST002, TEST003, TEST004];
