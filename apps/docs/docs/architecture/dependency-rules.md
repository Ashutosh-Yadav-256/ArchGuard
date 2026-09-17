---
id: dependency-rules
title: Dependency Rules & Direction
sidebar_label: Dependency Rules
---

# Dependency Rules & Direction

## The Dependency Inversion Principle (DIP)

High-level modules must not depend on low-level modules; both should depend on abstractions. Abstractions should not depend on details; details should depend on abstractions.

### Direction of Dependencies

Dependencies must always point inwards towards business domains:

- **Presentation → Business Domain**
- **Persistence → Business Domain** (via Interfaces)
- **Infrastructure → Business Domain** (via Interfaces)

### Avoiding Inverted & Circular Dependencies

When a repository imports from a controller, an inverted circular relationship is introduced. The persistence layer can no longer be compiled, tested, or executed without bringing along the entire HTTP web framework.

### Standard Conventions

1. **Extract Shared Contracts**: If a controller and a repository need to share a data structure, extract it into a domain entity or shared model file.
2. **Dependency Injection**: Services and controllers receive their dependencies through constructor injection or IoC containers.
