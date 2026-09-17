export { parseTypeScript } from "./typescript/ts-parser.js";
export type {
  ParseResult,
  ImportInfo,
  ClassInfo,
  MethodInfo,
  PropertyInfo,
  FunctionInfo,
  VariableInfo,
} from "./typescript/ts-parser.js";

export {
  hasImportFromLayer,
  classifyImportLayer,
  isDatabaseImport,
} from "./typescript/import-analyzer.js";
export type { ArchitecturalLayer } from "./typescript/import-analyzer.js";

export {
  classifyFile,
  detectLanguage,
  isAnalyzableFile,
} from "./file-classifier.js";
export type { FileClassification } from "./file-classifier.js";
