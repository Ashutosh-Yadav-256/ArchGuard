import type { Rule } from "../models/rule.js";
import type { RuleCategory } from "../models/severity.js";

/**
 * RuleRegistry — a centralized registry for all available rules.
 *
 * Rules register themselves at startup. The registry provides
 * lookup by ID, category, and filtering capabilities used by
 * the RuleSelector and RuleEngine.
 */
export class RuleRegistry {
  private readonly rules: Map<string, Rule> = new Map();

  /**
   * Register a single rule.
   * @throws if a rule with the same ID is already registered
   */
  register(rule: Rule): void {
    if (this.rules.has(rule.id)) {
      throw new Error(
        `Rule "${rule.id}" is already registered. Rule IDs must be unique.`,
      );
    }
    this.rules.set(rule.id, rule);
  }

  /**
   * Register multiple rules at once.
   */
  registerAll(rules: readonly Rule[]): void {
    for (const rule of rules) {
      this.register(rule);
    }
  }

  /**
   * Get a rule by its ID.
   * @returns the Rule, or undefined if not found
   */
  get(id: string): Rule | undefined {
    return this.rules.get(id);
  }

  /**
   * Get all registered rules.
   */
  getAll(): readonly Rule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Get all rules in a specific category.
   */
  getByCategory(category: RuleCategory): readonly Rule[] {
    return this.getAll().filter((rule) => rule.category === category);
  }

  /**
   * Get the total number of registered rules.
   */
  get size(): number {
    return this.rules.size;
  }

  /**
   * Check if a rule with the given ID is registered.
   */
  has(id: string): boolean {
    return this.rules.has(id);
  }

  /**
   * Remove a rule by ID.
   * @returns true if the rule was found and removed
   */
  remove(id: string): boolean {
    return this.rules.delete(id);
  }

  /**
   * Clear all registered rules.
   */
  clear(): void {
    this.rules.clear();
  }
}
