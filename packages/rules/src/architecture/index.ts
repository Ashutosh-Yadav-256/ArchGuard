export { ARCH001 } from "./ARCH-001.js";
export { ARCH002 } from "./ARCH-002.js";
export { ARCH003 } from "./ARCH-003.js";
export { ARCH004 } from "./ARCH-004.js";

import { ARCH001 } from "./ARCH-001.js";
import { ARCH002 } from "./ARCH-002.js";
import { ARCH003 } from "./ARCH-003.js";
import { ARCH004 } from "./ARCH-004.js";
import type { Rule } from "@archstandards/core";

export const architectureRules: readonly Rule[] = [ARCH001, ARCH002, ARCH003, ARCH004];
