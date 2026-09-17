export const config = {
  port: parseInt(process.env["PORT"] ?? "8080", 10),
  databaseUrl: process.env["DATABASE_URL"] ?? "postgres://localhost:5432/app",
  awsAccessKeyId: process.env["AWS_ACCESS_KEY_ID"] ?? "",
  isProduction: process.env["NODE_ENV"] === "production",
};
