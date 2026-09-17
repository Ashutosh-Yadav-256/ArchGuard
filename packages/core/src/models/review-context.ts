import type { FileType } from "./severity.js";

/**
 * Represents a single file in the context of a review.
 * Contains the file's content, metadata, and classification.
 */
export interface ReviewFile {
  /** File path relative to repository root */
  readonly path: string;

  /** Full file content */
  readonly content: string;

  /** Detected file type classification */
  readonly fileType: FileType;

  /** Detected programming language */
  readonly language: string;

  /** Lines that were changed in the PR (for targeted analysis) */
  readonly changedLines?: readonly number[];
}

/**
 * Context provided to each rule during evaluation.
 * Contains all information a rule needs to analyze a file.
 */
export interface RuleContext {
  /** The file being analyzed */
  readonly file: ReviewFile;

  /** All files in the PR (for cross-file analysis like import graphs) */
  readonly allFiles: readonly ReviewFile[];

  /** Repository owner */
  readonly owner: string;

  /** Repository name */
  readonly repo: string;

  /** PR number */
  readonly pullNumber: number;

  /** Commit SHA being reviewed */
  readonly commitSha: string;
}

/**
 * Full review context for the orchestrator.
 */
export interface ReviewContext {
  /** Repository owner */
  readonly owner: string;

  /** Repository name */
  readonly repo: string;

  /** PR number */
  readonly pullNumber: number;

  /** Commit SHA being reviewed */
  readonly commitSha: string;

  /** Installation ID for GitHub App authentication */
  readonly installationId: number;

  /** Files changed in the PR */
  readonly files: readonly ReviewFile[];
}
