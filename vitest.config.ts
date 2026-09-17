import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@archstandards/core": path.resolve(__dirname, "packages/core/src/index.ts"),
      "@archstandards/parsers": path.resolve(__dirname, "packages/parsers/src/index.ts"),
      "@archstandards/rules": path.resolve(__dirname, "packages/rules/src/index.ts"),
      "@archstandards/github-adapter": path.resolve(
        __dirname,
        "packages/github-adapter/src/index.ts",
      ),
    },
  },
  test: {
    globals: true,
    environment: "node",
    include: ["packages/*/tests/**/*.test.ts", "apps/*/tests/**/*.test.ts"],
    testTimeout: 15000,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["packages/*/src/**/*.ts", "apps/*/src/**/*.ts"],
      exclude: ["**/*.d.ts", "**/index.ts", "**/types.ts", "**/__mocks__/**", "**/tests/**"],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
  },
});
