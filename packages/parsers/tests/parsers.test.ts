import { describe, it, expect } from "vitest";
import { classifyFile, detectLanguage, isAnalyzableFile } from "../src/file-classifier.js";
import { classifyImportLayer, isDatabaseImport } from "../src/typescript/import-analyzer.js";
import { parseTypeScript } from "../src/typescript/ts-parser.js";

// ─── File Classifier Tests ─────────────────────────────────────

describe("File Classifier", () => {
  it("should classify controller files", () => {
    expect(classifyFile("src/order/order.controller.ts")).toBe("controller");
    expect(classifyFile("src/controllers/OrderController.ts")).toBe("controller");
    expect(classifyFile("src/order/order.handler.ts")).toBe("controller");
  });

  it("should classify service files", () => {
    expect(classifyFile("src/order/order.service.ts")).toBe("service");
    expect(classifyFile("src/services/OrderService.ts")).toBe("service");
  });

  it("should classify repository files", () => {
    expect(classifyFile("src/order/order.repository.ts")).toBe("repository");
    expect(classifyFile("src/repositories/OrderRepo.ts")).toBe("repository");
  });

  it("should classify test files", () => {
    expect(classifyFile("src/order/order.service.test.ts")).toBe("test");
    expect(classifyFile("src/order/order.service.spec.ts")).toBe("test");
    expect(classifyFile("src/__tests__/order.ts")).toBe("test");
  });

  it("should classify config files", () => {
    expect(classifyFile("src/config/database.config.ts")).toBe("config");
  });

  it("should return unknown for unrecognized files", () => {
    expect(classifyFile("src/index.ts")).toBe("unknown");
  });
});

describe("Language Detection", () => {
  it("should detect TypeScript", () => {
    expect(detectLanguage("file.ts")).toBe("typescript");
    expect(detectLanguage("file.tsx")).toBe("typescript");
  });

  it("should detect JavaScript", () => {
    expect(detectLanguage("file.js")).toBe("javascript");
    expect(detectLanguage("file.jsx")).toBe("javascript");
  });

  it("should detect other languages", () => {
    expect(detectLanguage("file.py")).toBe("python");
    expect(detectLanguage("file.java")).toBe("java");
  });

  it("should return unknown for unrecognized extensions", () => {
    expect(detectLanguage("file.xyz")).toBe("unknown");
  });
});

// ─── Import Analyzer Tests ─────────────────────────────────────

describe("Import Analyzer", () => {
  it("should classify repository imports", () => {
    expect(classifyImportLayer("./OrderRepository")).toBe("repository");
    expect(classifyImportLayer("../repos/UserRepo")).toBe("repository");
  });

  it("should classify controller imports", () => {
    expect(classifyImportLayer("./OrderController")).toBe("controller");
    expect(classifyImportLayer("../handlers/UserHandler")).toBe("controller");
  });

  it("should classify service imports", () => {
    expect(classifyImportLayer("./OrderService")).toBe("service");
  });

  it("should detect database imports", () => {
    expect(isDatabaseImport("typeorm")).toBe(true);
    expect(isDatabaseImport("prisma")).toBe(true);
    expect(isDatabaseImport("@prisma/client")).toBe(true);
    expect(isDatabaseImport("lodash")).toBe(false);
  });
});

// ─── TypeScript Parser Tests ───────────────────────────────────

describe("TypeScript Parser", () => {
  it("should extract import declarations", () => {
    const code = `
import { OrderService } from "./order.service";
import * as db from "typeorm";
import express from "express";
`;
    const result = parseTypeScript(code);

    expect(result.imports).toHaveLength(3);
    expect(result.imports[0]!.namedImports).toContain("OrderService");
    expect(result.imports[1]!.isNamespaceImport).toBe(true);
    expect(result.imports[2]!.defaultImport).toBe("express");
  });

  it("should extract class declarations", () => {
    const code = `
export class OrderController {
  async createOrder(req: Request, res: Response) {
    const order = await this.service.create(req.body);
    res.status(201).json(order);
  }

  getOrder() {
    return "test";
  }
}
`;
    const result = parseTypeScript(code);

    expect(result.classes).toHaveLength(1);
    expect(result.classes[0]!.name).toBe("OrderController");
    expect(result.classes[0]!.isExported).toBe(true);
    expect(result.classes[0]!.methods).toHaveLength(2);
    expect(result.classes[0]!.methods[0]!.isAsync).toBe(true);
  });

  it("should extract function declarations", () => {
    const code = `
export function processOrder(data: unknown) {
  return data;
}

async function helperFn() {
  return 42;
}
`;
    const result = parseTypeScript(code);

    expect(result.functions).toHaveLength(2);
    expect(result.functions[0]!.name).toBe("processOrder");
    expect(result.functions[0]!.isExported).toBe(true);
    expect(result.functions[1]!.isAsync).toBe(true);
  });

  it("should extract variable declarations with boolean type", () => {
    const code = `
const isActive: boolean = true;
let name: string = "test";
`;
    const result = parseTypeScript(code);

    expect(result.variables).toHaveLength(2);
    expect(result.variables[0]!.isBoolean).toBe(true);
    expect(result.variables[0]!.isConst).toBe(true);
    expect(result.variables[1]!.isBoolean).toBe(false);
  });
});
