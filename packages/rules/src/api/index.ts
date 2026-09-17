export { API001 } from "./API-001.js";
export { API002 } from "./API-002.js";
export { API003 } from "./API-003.js";
export { API004 } from "./API-004.js";

import { API001 } from "./API-001.js";
import { API002 } from "./API-002.js";
import { API003 } from "./API-003.js";
import { API004 } from "./API-004.js";
import type { Rule } from "@archstandards/core";

export const apiRules: readonly Rule[] = [API001, API002, API003, API004];
