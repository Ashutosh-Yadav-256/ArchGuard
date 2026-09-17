---
id: integration-testing
title: Integration Testing Standards
sidebar_label: Integration Testing
---

# Integration Testing Standards

## Scope & Purpose

Integration tests verify that individual units collaborate correctly with external dependencies:

- Web framework routers → Controllers → Services
- Repositories → Database instances (via testcontainers or in-memory databases)
- Event producers → Message brokers

## Best Practices

1. **Use Real Wire Protocols**: Use ephemeral Docker containers (e.g. via Testcontainers) rather than in-memory mocks when testing complex SQL queries or database transactions.
2. **Deterministic State**: Each test must clean up its state before and after execution to prevent test interdependency.
