---
id: error-handling
title: API Error Handling & Schemas
sidebar_label: Error Handling
---

# API Error Handling & Schemas

## The Problem with Raw String Errors

Returning plain strings like `res.status(400).send("Invalid email")` forces client developers to parse arbitrary text to determine what went wrong.

## The Standard Error Schema (RFC 7807)

All API error responses must return a structured JSON error object:

```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "The provided email address is invalid.",
    "details": [
      {
        "field": "email",
        "issue": "must be a valid RFC 5322 address"
      }
    ]
  }
}
```

### Requirements

- Error responses (4xx, 5xx) must never return raw string responses.
- Enforced by rule **`API-004`**.
- Catch blocks must return appropriate error status codes (4xx/5xx) and never mask failures with HTTP 200. Enforced by rule **`API-001`**.
