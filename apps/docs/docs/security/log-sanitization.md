---
id: log-sanitization
title: Log Sanitization & Sensitive Data
sidebar_label: Log Sanitization
---

# Log Sanitization & Sensitive Data

## Preventing Credential Exposure in Telemetry

Application logs are ingested, indexed, and aggregated into third-party observability providers (Datadog, Grafana Loki, CloudWatch) where broad access is common.

## Policy Requirements

- Never log raw passwords, access tokens, API secrets, or credit card numbers.
- Log arguments containing variables named `password`, `token`, `secret`, `credential`, or `authorization` will be flagged by rule **`SEC-002`**.
- Redact sensitive data before writing to logs.
