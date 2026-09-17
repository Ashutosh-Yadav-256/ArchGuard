export { SEC001 } from "./SEC-001.js";
export { SEC002 } from "./SEC-002.js";
export { SEC003 } from "./SEC-003.js";

import { SEC001 } from "./SEC-001.js";
import { SEC002 } from "./SEC-002.js";
import { SEC003 } from "./SEC-003.js";
import type { Rule } from "@archstandards/core";

export const securityRules: readonly Rule[] = [SEC001, SEC002, SEC003];
