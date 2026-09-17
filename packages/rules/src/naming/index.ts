export { NAME001 } from "./NAME-001.js";
export { NAME002 } from "./NAME-002.js";
export { NAME003 } from "./NAME-003.js";

import { NAME001 } from "./NAME-001.js";
import { NAME002 } from "./NAME-002.js";
import { NAME003 } from "./NAME-003.js";
import type { Rule } from "@archstandards/core";

export const namingRules: readonly Rule[] = [NAME001, NAME002, NAME003];
