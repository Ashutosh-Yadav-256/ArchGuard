[English](../../README.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Русский](README.ru.md) | [Français](README.fr.md) | [हिन्दी](README.hi.md) | [Español](README.es.md) | [Deutsch](README.de.md) | [Português](README.pt.md) | [العربية](README.ar.md)

---

# ArchStandards

> **Plataforma de gobernanza de arquitectura como código (Policy-as-Code)**: revisa automáticamente los Pull Requests en función de estándares de ingeniería versionados, previene la degradación arquitectónica y ofrece orientación accionable basada en el árbol de sintaxis abstracta (AST).

[![CI](https://github.com/Ashutosh-Yadav-256/ArchStandards/actions/workflows/ci.yml/badge.svg)](https://github.com/Ashutosh-Yadav-256/ArchStandards/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../../LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-116%20passed-brightgreen)](https://vitest.dev/)
[![Coverage](https://img.shields.io/badge/Coverage-83.7%25-brightgreen)](https://github.com/Ashutosh-Yadav-256/ArchStandards)
[![Throughput](https://img.shields.io/badge/Parser%20Speed-145k%20lines%2Fs-orange)](#rendimiento-y-benchmarks)

---

## ¿Qué es ArchStandards?

La documentación arquitectónica en wikis y páginas de Notion suele quedar obsoleta con rapidez, ya que los desarrolladores carecen de tiempo para comprobar manualmente normas estáticas durante revisiones de código aceleradas.

**ArchStandards** soluciona esta brecha transformando sus manuales de ingeniería en verificaciones automáticas de GitHub Checks:

- **Análisis AST estático**: Emplea la API del compilador de TypeScript para inspección sintáctica profunda, métricas de métodos/clases y análisis del grafo de dependencias entre capas.
- **Anotaciones inline en PR**: Explicaciones detalladas de incumplimientos, justificaciones arquitectónicas y sugerencias de corrección directamente en las líneas del diff.
- **Puntuación de salud arquitectónica (0 - 100)**: Evalúa objetivamente la calidad del PR y puede bloquear fusiones ante deuda técnica crítica.
- **Playbook interactivo de ingeniería**: Integración directa con un portal Docusaurus que explica el motivo de cada regla y cómo remediarla.
- **Excepciones técnicas con caducidad**: Gestión declarativa de deuda técnica en `.archstandards/config.yaml` con justificación y fecha de vencimiento obligatorias.

---

## Arquitectura del sistema

```text
  Desarrollador abre / actualiza un PR
               │
               ▼
   [ Servidor Webhook Fastify ] ── Verificación criptográfica segura HMAC-SHA256
               │
               ▼
    [ Capa Adaptador de GitHub ] ─ Obtención de archivos cambiados y diff (Octokit)
               │
               ▼
      [ Motor ArchStandards Core ] ─── Parseadores AST y clasificador de archivos
               │
        ┌──────┴──────┐
        ▼             ▼
   [ 18 Reglas ] [ Excepciones ]
        │             │
        └──────┬──────┘
               ▼
     [ Agregador de hallazgos ] ── Cálculo de deducciones y puntuación de salud
               │
               ▼
    [ GitHub Check Run API ] ───── Anotaciones nativas y reporte Markdown
```

---

## Catálogo de las 18 reglas integradas

| Dominio            | ID de Regla | Descripción del estándar                                                   | Gravedad predeterminada |
| :----------------- | :---------- | :------------------------------------------------------------------------- | :---------------------- |
| **Arquitectura**   | `ARCH-001`  | Los controladores no deben importar repositorios directamente (3 capas)    | `error`                 |
|                    | `ARCH-002`  | Los controladores no deben contener lógica de negocio extensa (>20 líneas) | `warning`               |
|                    | `ARCH-003`  | Los servicios no deben depender de frameworks HTTP/web (Express/Fastify)   | `error`                 |
|                    | `ARCH-004`  | Se prohíben dependencias circulares entre módulos de la aplicación         | `error`                 |
| **Estándares API** | `API-001`   | Los endpoints deben validar entradas de solicitud (Zod, Joi)               | `warning`               |
|                    | `API-002`   | Los endpoints públicos deben declarar middleware de limitación de tasa     | `warning`               |
|                    | `API-003`   | Los endpoints POST de creación deben responder con HTTP 201 Created        | `warning`               |
|                    | `API-004`   | Las respuestas de error deben seguir el estándar RFC 7807                  | `info`                  |
| **Pruebas**        | `TEST-001`  | Nuevos servicios requieren sus respectivos archivos de prueba unitaria     | `error`                 |
|                    | `TEST-002`  | Lógica de negocio crítica (>15 líneas) requiere pruebas dedicadas          | `warning`               |
|                    | `TEST-003`  | El repositorio debe mantener un ratio mínimo del 80% en pruebas            | `warning`               |
|                    | `TEST-004`  | Prohibido omitir pruebas (`.skip`, `xit`) para forzar el paso en CI        | `error`                 |
| **Seguridad**      | `SEC-001`   | El código fuente no debe contener claves de API ni contraseñas             | `error`                 |
|                    | `SEC-002`   | Prohibido imprimir credenciales o contraseñas en los registros (logs)      | `error`                 |
|                    | `SEC-003`   | Cadenas de conexión a BD deben usar variables de entorno                   | `warning`               |
| **Nomenclatura**   | `NAME-001`  | Clases e interfaces deben usar formato PascalCase                          | `info`                  |
|                    | `NAME-002`  | Funciones y métodos deben usar formato camelCase                           | `info`                  |
|                    | `NAME-003`  | Variables booleanas deben usar prefijos afirmativos (`is`/`has`/`can`)     | `info`                  |

---

## Rendimiento y benchmarks

Medido empíricamente en Node.js v22 con temporizadores monotónicos de alta precisión (`performance.now()`):

| Prueba de benchmark           | Escala                                        | Medición empírica                                |
| :---------------------------- | :-------------------------------------------- | :----------------------------------------------- |
| **Velocidad de parseo AST**   | Archivos pequeños (~100 líneas)               | **55.558 líneas/seg** (1.73 ms promedio)         |
| **Velocidad de parseo AST**   | Archivos grandes (~2.000 líneas)              | **145.214 líneas/seg** (14.5 ms promedio)        |
| **Velocidad de parseo AST**   | Archivos masivos (~5.000 líneas)              | **136.134 líneas/seg** (38.6 ms promedio)        |
| **Latencia de reglas**        | RegEx / Comprobación de manifiesto            | **0.002 ms** (hasta 493.827 ops/seg)             |
| **Latencia de reglas**        | Recorrido exhaustivo del AST                  | **1.1 – 1.7 ms**                                 |
| **Pipeline E2E de PR**        | PR pequeño (3 archivos, 161 líneas)           | **11.39 ms** (p95: 15.58 ms)                     |
| **Pipeline E2E de PR**        | PR monorepo (100 archivos, ~6.000 líneas)     | **298.44 ms** (p95: 369.12 ms)                   |
| **Verificación HMAC Webhook** | Comparación criptográfica en tiempo constante | **0.362 ms** (2.760 req/seg)                     |
| **Precisión de detección**    | Corpus de pruebas real                        | **100.0%** (0 falsos positivos en código limpio) |

---

## Estructura del monorepositorio

```text
ArchStandards/
├── apps/
│   ├── github-app/
│   └── docs/
├── packages/
│   ├── core/
│   ├── rules/
│   ├── parsers/
│   └── github-adapter/
├── benchmarks/
├── examples/
└── policies/
```

---

## Cómo empezar

### Requisitos previos

- Node.js $\ge 20.0.0$
- pnpm $\ge 9.0.0$

### Instalación y compilación

```bash
git clone https://github.com/Ashutosh-Yadav-256/ArchStandards.git
cd ArchStandards

pnpm install

pnpm build

pnpm test

pnpm benchmark
```

### Ejecución local

```bash
pnpm --filter @archstandards/github-app start

pnpm --filter @archstandards/docs start
```

---

## Configuración (`.archstandards/config.yaml`)

```yaml
version: "1.0"

rules:
  include:
    - "*"
  exclude:
    - "NAME-*"

policy:
  fail_on:
    - "error"
  warn_on:
    - "warning"

scoring:
  base: 100
  deductions:
    error: 15
    warning: 5
    info: 1

exceptions:
  - rule: "ARCH-001"
    path: "src/controllers/legacy-export.controller.ts"
    reason: "Direct query optimization required pending database migration."
    expires: "2026-12-31"
```

---

## Contribuciones

¡Las contribuciones son muy bienvenidas! Consulta [CONTRIBUTING.md](../../CONTRIBUTING.md) para el flujo de trabajo y [SECURITY.md](../../SECURITY.md) para la divulgación de vulnerabilidades.

---

## Soporte y contacto

Para consultas o soporte, escribe a: **[ashutosh4tech@gmail.com](mailto:ashutosh4tech@gmail.com)**.

---

## Licencia

[MIT](../../LICENSE) © [Ashutosh Yadav](https://github.com/Ashutosh-Yadav-256)
