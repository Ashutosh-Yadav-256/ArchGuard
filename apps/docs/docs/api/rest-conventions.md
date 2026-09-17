---
id: rest-conventions
title: RESTful API Conventions
sidebar_label: REST Conventions
---

# RESTful API Conventions

## Core Principles

REST APIs should model systems around **resources** rather than actions. HTTP verbs define the operations performed on resources.

### Resource Naming Standards

1. **Use Plural Nouns**:
   - ✅ `/api/orders`
   - ✅ `/api/users/42/tokens`
   - ❌ `/api/order`
   - ❌ `/api/getUser`

2. **No Verbs in URIs**:
   - HTTP verbs (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) indicate the action.
   - ❌ `/api/getUsers` → Use `GET /api/users`
   - ❌ `/api/createOrder` → Use `POST /api/orders`
   - ❌ `/api/deleteItem` → Use `DELETE /api/items/{id}`
   - Enforced by rule **`API-002`**.

3. **HTTP Status Codes for Responses**:
   - `200 OK`: Successful read or update
   - `201 Created`: Resource successfully created (enforced on POST by **`API-003`**)
   - `204 No Content`: Successful deletion or operation with no response body
   - `400 Bad Request`: Client input validation error
   - `401 Unauthorized`: Authentication missing or invalid
   - `403 Forbidden`: Authenticated user lacks permission
   - `404 Not Found`: Resource does not exist
   - `500 Internal Server Error`: Unhandled server exception (never return 200 for errors, enforced by **`API-001`**)
