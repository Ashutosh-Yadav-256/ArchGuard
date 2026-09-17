---
id: configuration
title: 12-Factor App Configuration
sidebar_label: Configuration
---

# 12-Factor App Configuration

## Principles

The 12-factor app methodology mandates strict separation of configuration from code. Configuration varies substantially across deploys (development, staging, production); code does not.

## Requirements

1. **Environment Variables**:
   - Connection strings (`DATABASE_URL`, `REDIS_URL`), third-party hostnames, and service credentials must be loaded via `process.env`.
   - Never commit hardcoded connection URIs in application code.
   - Enforced by rule **`SEC-003`**.

2. **Template Documentation**:
   - Every repository must maintain a `.env.example` documenting all expected environment variables without including sensitive production values.
