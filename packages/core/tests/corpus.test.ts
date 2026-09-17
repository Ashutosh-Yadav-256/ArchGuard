import { describe, it, expect } from "vitest";
import { runCorpusValidation } from "../../../examples/test-harness.js";

describe("Phase 7 — Test Corpus & Detection Accuracy", () => {
  const { results, overallAccuracy, allPassed } = runCorpusValidation();

  it("should achieve 100% detection accuracy across all known test cases", () => {
    expect(overallAccuracy).toBe(100);
    expect(allPassed).toBe(true);
  });

  for (const suite of results) {
    describe(`Corpus Suite: ${suite.suiteName}`, () => {
      it(`should detect all expected rules (${suite.expectedRules.join(", ") || "none"})`, () => {
        expect(suite.allDetected).toBe(true);
      });

      if (suite.suiteName.includes("Clean")) {
        it("should have zero false positive findings on clean project", () => {
          expect(suite.findingsCount).toBe(0);
          expect(suite.score).toBe(100);
          expect(suite.status).toBe("pass");
        });
      } else {
        it("should produce findings and reflect correct status", () => {
          expect(suite.findingsCount).toBeGreaterThan(0);
          expect(suite.score).toBeLessThan(100);
        });
      }
    });
  }
});
