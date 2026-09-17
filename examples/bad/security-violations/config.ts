// Violation of SEC-001: Hardcoded AWS secret key
export const AWS_ACCESS_KEY = "AKIAIOSFODNN7EXAMPLE";

// Violation of SEC-003: Sensitive database connection string in source code
export const DATABASE_URL = "postgres://admin:superSecretPass123@db.internal:5432/production";
