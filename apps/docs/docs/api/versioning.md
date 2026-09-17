---
id: versioning
title: API Versioning Strategy
sidebar_label: Versioning
---

# API Versioning Strategy

## Standards

1. **URI Path Versioning**:
   - Public and internal APIs must prefix routes with the major version:
   - `/api/v1/orders`
   - `/api/v2/orders`

2. **Backward Compatibility**:
   - Non-breaking changes (adding optional query parameters or new response fields) do not require incrementing major version numbers.
   - Breaking changes (removing fields, changing field types, altering validation rules) require introducing a new major version path.

3. **Deprecation Policy**:
   - Mark deprecated endpoints with `Sunset` and `Deprecation` HTTP response headers.
