---
id: secrets-management
title: Secrets Management & Scanning
sidebar_label: Secrets Management
---

# Secrets Management & Scanning

## Zero Hardcoded Secrets Policy

API keys, private keys, authentication tokens, and passwords must **never** be committed to version control. Even in private repositories, hardcoded secrets represent significant security liabilities.

## Requirements

1. **No High-Entropy or Known Secret Patterns**:
   - AWS access keys (`AKIA...`), GitHub personal access tokens (`ghp_...`), Stripe keys (`sk_live_...`, `sk_test_...`), and private certificates must not appear in source code.
   - Enforced by rule **`SEC-001`**.

2. **Secret Rotation**:
   - Any secret accidentally committed to a repository must be immediately revoked and rotated.
