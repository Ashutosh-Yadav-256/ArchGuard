import ts from "typescript";

/**
 * Import information extracted from a TypeScript source file.
 */
export interface ImportInfo {
  /** The module specifier (e.g., "./OrderRepository", "express") */
  readonly moduleSpecifier: string;

  /** Named imports (e.g., ["OrderRepository", "OrderService"]) */
  readonly namedImports: readonly string[];

  /** Default import name, if any */
  readonly defaultImport?: string;

  /** Whether this is a namespace import (import * as X) */
  readonly isNamespaceImport: boolean;

  /** Line number of the import statement (1-indexed) */
  readonly line: number;
}

/**
 * Class declaration information.
 */
export interface ClassInfo {
  readonly name: string;
  readonly line: number;
  readonly methods: readonly MethodInfo[];
  readonly properties: readonly PropertyInfo[];
  readonly isExported: boolean;
}

/**
 * Method information extracted from a class.
 */
export interface MethodInfo {
  readonly name: string;
  readonly line: number;
  readonly endLine: number;
  readonly isAsync: boolean;
  readonly parameters: readonly string[];
  readonly lineCount: number;
}

/**
 * Property information extracted from a class or variable declaration.
 */
export interface PropertyInfo {
  readonly name: string;
  readonly line: number;
  readonly typeName?: string;
  readonly isBoolean: boolean;
}

/**
 * Function declaration information.
 */
export interface FunctionInfo {
  readonly name: string;
  readonly line: number;
  readonly endLine: number;
  readonly isExported: boolean;
  readonly isAsync: boolean;
  readonly lineCount: number;
}

/**
 * Complete analysis result for a TypeScript source file.
 */
export interface ParseResult {
  readonly imports: readonly ImportInfo[];
  readonly classes: readonly ClassInfo[];
  readonly functions: readonly FunctionInfo[];
  readonly variables: readonly VariableInfo[];
  readonly lineCount: number;
}

/**
 * Variable declaration information.
 */
export interface VariableInfo {
  readonly name: string;
  readonly line: number;
  readonly isConst: boolean;
  readonly isExported: boolean;
  readonly typeName?: string;
  readonly isBoolean: boolean;
}

/**
 * Parse a TypeScript source file and extract structural information.
 *
 * Uses the TypeScript Compiler API for accurate AST analysis rather
 * than unreliable regex-based parsing.
 */
export function parseTypeScript(content: string, fileName: string = "file.ts"): ParseResult {
  const sourceFile = ts.createSourceFile(
    fileName,
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  const imports: ImportInfo[] = [];
  const classes: ClassInfo[] = [];
  const functions: FunctionInfo[] = [];
  const variables: VariableInfo[] = [];

  function visit(node: ts.Node): void {
    // ─── Import Declarations ─────────────────────────
    if (ts.isImportDeclaration(node)) {
      const importInfo = extractImport(node, sourceFile);
      if (importInfo) {
        imports.push(importInfo);
      }
    }

    // ─── Class Declarations ──────────────────────────
    if (ts.isClassDeclaration(node)) {
      const classInfo = extractClass(node, sourceFile);
      if (classInfo) {
        classes.push(classInfo);
      }
    }

    // ─── Function Declarations ───────────────────────
    if (ts.isFunctionDeclaration(node)) {
      const funcInfo = extractFunction(node, sourceFile);
      if (funcInfo) {
        functions.push(funcInfo);
      }
    }

    // ─── Variable Declarations ───────────────────────
    if (ts.isVariableStatement(node)) {
      const vars = extractVariables(node, sourceFile);
      variables.push(...vars);
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return {
    imports,
    classes,
    functions,
    variables,
    lineCount: sourceFile.getLineAndCharacterOfPosition(content.length).line + 1,
  };
}

// ─── Extraction Helpers ──────────────────────────────────────

function extractImport(node: ts.ImportDeclaration, sourceFile: ts.SourceFile): ImportInfo | null {
  const moduleSpecifier = (node.moduleSpecifier as ts.StringLiteral).text;
  const line = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;

  const namedImports: string[] = [];
  let defaultImport: string | undefined;
  let isNamespaceImport = false;

  const importClause = node.importClause;
  if (importClause) {
    // Default import
    if (importClause.name) {
      defaultImport = importClause.name.text;
    }

    // Named bindings
    if (importClause.namedBindings) {
      if (ts.isNamedImports(importClause.namedBindings)) {
        for (const element of importClause.namedBindings.elements) {
          namedImports.push(element.name.text);
        }
      } else if (ts.isNamespaceImport(importClause.namedBindings)) {
        isNamespaceImport = true;
        defaultImport = importClause.namedBindings.name.text;
      }
    }
  }

  return {
    moduleSpecifier,
    namedImports,
    defaultImport,
    isNamespaceImport,
    line,
  };
}

function extractClass(node: ts.ClassDeclaration, sourceFile: ts.SourceFile): ClassInfo | null {
  const name = node.name?.text;
  if (!name) return null;

  const line = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
  const isExported = hasExportModifier(node);

  const methods: MethodInfo[] = [];
  const properties: PropertyInfo[] = [];

  for (const member of node.members) {
    if (ts.isMethodDeclaration(member) && member.name) {
      const methodName = member.name.getText(sourceFile);
      const methodLine =
        sourceFile.getLineAndCharacterOfPosition(member.getStart(sourceFile)).line + 1;
      const methodEndLine = sourceFile.getLineAndCharacterOfPosition(member.getEnd()).line + 1;

      methods.push({
        name: methodName,
        line: methodLine,
        endLine: methodEndLine,
        isAsync: hasAsyncModifier(member),
        parameters: member.parameters.map((p) => p.name.getText(sourceFile)),
        lineCount: methodEndLine - methodLine + 1,
      });
    }

    if (ts.isPropertyDeclaration(member) && member.name) {
      const propName = member.name.getText(sourceFile);
      const propLine =
        sourceFile.getLineAndCharacterOfPosition(member.getStart(sourceFile)).line + 1;

      properties.push({
        name: propName,
        line: propLine,
        typeName: member.type?.getText(sourceFile),
        isBoolean: isBooleanType(member.type),
      });
    }
  }

  return {
    name,
    line,
    methods,
    properties,
    isExported,
  };
}

function extractFunction(
  node: ts.FunctionDeclaration,
  sourceFile: ts.SourceFile,
): FunctionInfo | null {
  const name = node.name?.text;
  if (!name) return null;

  const line = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
  const endLine = sourceFile.getLineAndCharacterOfPosition(node.getEnd()).line + 1;

  return {
    name,
    line,
    endLine,
    isExported: hasExportModifier(node),
    isAsync: hasAsyncModifier(node),
    lineCount: endLine - line + 1,
  };
}

function extractVariables(node: ts.VariableStatement, sourceFile: ts.SourceFile): VariableInfo[] {
  const isExported = hasExportModifier(node);
  const isConst = (node.declarationList.flags & ts.NodeFlags.Const) !== 0;

  return node.declarationList.declarations.map((decl) => {
    const name = decl.name.getText(sourceFile);
    const line = sourceFile.getLineAndCharacterOfPosition(decl.getStart(sourceFile)).line + 1;

    return {
      name,
      line,
      isConst,
      isExported,
      typeName: decl.type?.getText(sourceFile),
      isBoolean: isBooleanType(decl.type),
    };
  });
}

// ─── Utility Helpers ─────────────────────────────────────────

function hasExportModifier(node: ts.Node): boolean {
  const modifiers = ts.canHaveModifiers(node) ? ts.getModifiers(node) : undefined;
  return modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ?? false;
}

function hasAsyncModifier(node: ts.Node): boolean {
  const modifiers = ts.canHaveModifiers(node) ? ts.getModifiers(node) : undefined;
  return modifiers?.some((m) => m.kind === ts.SyntaxKind.AsyncKeyword) ?? false;
}

function isBooleanType(typeNode?: ts.TypeNode): boolean {
  if (!typeNode) return false;
  if (typeNode.kind === ts.SyntaxKind.BooleanKeyword) return true;
  return false;
}
