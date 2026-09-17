import type { Rule } from "../models/rule.js";
import type { RuleContext } from "../models/review-context.js";
import type { RulesFilter } from "../config/schemas.js";
import type { RuleRegistry } from "./rule-registry.js";

/**
 * RuleSelector — determines which rules should be evaluated for a given context.
 *
 * Filters the full set of registered rules based on:
 * 1. Config include/exclude patterns
 * 2. Rule `applies()` method (file type matching)
 */
export class RuleSelector {
  private readonly registry: RuleRegistry;

  constructor(registry: RuleRegistry) {
    this.registry = registry;
  }

  /**
   * Select rules that are applicable to the given context and match the filter.
   *
   * @param context - The file context to check applicability against
   * @param filter - Include/exclude patterns from config
   * @returns Rules that should be evaluated
   */
  select(context: RuleContext, filter: RulesFilter): readonly Rule[] {
    const allRules = this.registry.getAll();

    return allRules.filter((rule) => {
      // 1. Check include/exclude patterns
      if (!this.matchesFilter(rule, filter)) {
        return false;
      }

      // 2. Check if the rule applies to this context
      return rule.applies(context);
    });
  }

  /**
   * Check if a rule matches the include/exclude filter patterns.
   *
   * Include patterns:
   * - `*` matches all rules
   * - `architecture/*` matches all rules in the architecture category
   * - `ARCH-001` matches a specific rule
   *
   * Exclude patterns override includes:
   * - `TEST-003` excludes a specific rule
   * - `naming/*` excludes all naming rules
   */
  private matchesFilter(rule: Rule, filter: RulesFilter): boolean {
    const { include, exclude } = filter;

    // Check if explicitly excluded
    if (this.matchesAny(rule, exclude)) {
      return false;
    }

    // Check if included
    return this.matchesAny(rule, include);
  }

  /**
   * Check if a rule matches any of the given patterns.
   */
  private matchesAny(rule: Rule, patterns: readonly string[]): boolean {
    return patterns.some((pattern) => this.matchesPattern(rule, pattern));
  }

  /**
   * Match a rule against a single pattern.
   */
  private matchesPattern(rule: Rule, pattern: string): boolean {
    // Wildcard: match everything
    if (pattern === "*") {
      return true;
    }

    // Category wildcard: "architecture/*"
    if (pattern.endsWith("/*")) {
      const category = pattern.slice(0, -2);
      return rule.category === category;
    }

    // Exact ID match: "ARCH-001"
    return rule.id === pattern;
  }
}
