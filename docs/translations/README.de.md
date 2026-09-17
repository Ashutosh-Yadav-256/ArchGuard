[English](../../README.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Русский](README.ru.md) | [Français](README.fr.md) | [हिन्दी](README.hi.md) | [Español](README.es.md) | [Deutsch](README.de.md) | [Português](README.pt.md) | [العربية](README.ar.md)

---

# ArchStandards

> **Policy-as-Code Plattform für Architektur-Governance**: Überprüft Pull Requests automatisch anhand versionierter Engineering-Richtlinien, verhindert Architekturerosion und bietet Entwicklungsteams umsetzbare, AST-basierte Empfehlungen.

[![CI](https://github.com/Ashutosh-Yadav-256/ArchStandards/actions/workflows/ci.yml/badge.svg)](https://github.com/Ashutosh-Yadav-256/ArchStandards/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../../LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-116%20passed-brightgreen)](https://vitest.dev/)
[![Coverage](https://img.shields.io/badge/Coverage-83.7%25-brightgreen)](https://github.com/Ashutosh-Yadav-256/ArchStandards)
[![Throughput](https://img.shields.io/badge/Parser%20Speed-145k%20lines%2Fs-orange)](#leistung-und-benchmarks)

---

## Was ist ArchStandards?

Architekturdokumentationen in Wikis oder Notion veralten häufig, da Entwickler während schneller Code-Reviews kaum Zeit haben, statische Vorgaben manuell zu prüfen.

**ArchStandards** schließt diese Lücke, indem es Architekturrichtlinien in automatisierte, kontinuierliche GitHub Checks verwandelt:

- **Statische AST-Analyse**: Nutzt die TypeScript Compiler API für Syntaxprüfungen, Klassen- und Methodenmetriken sowie Importgraphen über Architekturebenen hinweg.
- **Inline PR-Annotationen**: Zeigt Regelverletzungen, architektonische Begründungen und Lösungsvorschläge direkt an den betroffenen Codezeilen an.
- **Architektur-Gesundheitswert (0 - 100)**: Bewertet die Codequalität objektiv und kann Merges bei kritischen Verstößen blockieren.
- **Interaktives Engineering-Playbook**: Vollständig integriert mit einer Docusaurus-Dokumentation, die den Hintergrund jeder Regel und die Behebung erklärt.
- **Ablaufende Architekturausnahmen**: Deklaratives Verwalten technischer Schulden in `.archstandards/config.yaml` mit verbindlicher Begründung und Ablaufdatum.

---

## Systemarchitektur

```text
  Entwickler erstellt / aktualisiert PR
               │
               ▼
   [ Fastify Webhook-Server ] ── HMAC-SHA256 Timing-Safe-Signaturprüfung
               │
               ▼
    [ GitHub Adapter-Schicht ] ─ Abrufen geänderter Dateien & Diffs (Octokit)
               │
               ▼
      [ ArchStandards Core ] ─────── AST-Parser und Dateiklassifizierer
               │
        ┌──────┴──────┐
        ▼             ▼
   [ 18 Regeln ] [ Ausnahmen ]
        │             │
        └──────┬──────┘
               ▼
     [ Ergebnis-Aggregator ] ─── Punkteabzug & Architektur-Gesundheitswert
               │
               ▼
    [ GitHub Check Run API ] ─── Native Annotationen und Markdown-Bericht
```

---

## Der Katalog der 18 integrierten Regeln

| Kategorie         | Regel-ID   | Beschreibung des Standards                                                     | Standardschweregrad |
| :---------------- | :--------- | :----------------------------------------------------------------------------- | :------------------ |
| **Architektur**   | `ARCH-001` | Controller dürfen Repositories nicht direkt importieren                        | `error`             |
|                   | `ARCH-002` | Controller sollten keine Geschäftslogik (>20 Zeilen) enthalten                 | `warning`           |
|                   | `ARCH-003` | Services dürfen nicht von HTTP-/Web-Frameworks abhängen                        | `error`             |
|                   | `ARCH-004` | Zirkuläre Abhängigkeiten zwischen Modulen sind verboten                        | `error`             |
| **API-Standards** | `API-001`  | Endpunkte müssen Eingabevalidierung deklarieren (Zod, Joi)                     | `warning`           |
|                   | `API-002`  | Öffentliche Endpunkte müssen Rate-Limiting-Middleware deklarieren              | `warning`           |
|                   | `API-003`  | POST-Ressourcenerstellungsendpunkte müssen HTTP 201 Created zurückgeben        | `warning`           |
|                   | `API-004`  | Fehlerantworten müssen der standardisierten Struktur (RFC 7807) folgen         | `info`              |
| **Testing**       | `TEST-001` | Neue Servicedateien erfordern zugehörige Unit-Test-Dateien                     | `error`             |
|                   | `TEST-002` | Kritische Logik (>15 Zeilen) benötigt dedizierte Tests                         | `warning`           |
|                   | `TEST-003` | Repositories müssen mindestens 80% Testdateienabdeckung beibehalten            | `warning`           |
|                   | `TEST-004` | Tests dürfen nicht übersprungen werden (`.skip`, `xit`), um die CI zu bestehen | `error`             |
| **Sicherheit**    | `SEC-001`  | Quellcodedateien dürfen keine fest einprogrammierten Geheimnisse enthalten     | `error`             |
|                   | `SEC-002`  | Passwörter und Tokens dürfen nicht in Logs ausgegeben werden                   | `error`             |
|                   | `SEC-003`  | Datenbankverbindungszeichenfolgen müssen Umgebungsvariablen nutzen             | `warning`           |
| **Namensgebung**  | `NAME-001` | Klassen und Interfaces müssen PascalCase verwenden                             | `info`              |
|                   | `NAME-002` | Funktionen und Methoden müssen camelCase verwenden                             | `info`              |
|                   | `NAME-003` | Boolesche Variablen müssen bejahende Präfixe nutzen (`is`/`has`/`can`)         | `info`              |

---

## Leistung und Benchmarks

Gemessen unter Node.js v22 mit hochpräzisen Zeitgebern (`performance.now()`):

| Benchmark-Test                 | Umfang                                   | Empirische Messung                          |
| :----------------------------- | :--------------------------------------- | :------------------------------------------ |
| **AST-Parser-Geschwindigkeit** | Kleine Dateien (~100 Zeilen)             | **55.558 Zeilen/Sek** (Ø 1.73 ms)           |
| **AST-Parser-Geschwindigkeit** | Große Dateien (~2.000 Zeilen)            | **145.214 Zeilen/Sek** (Ø 14.5 ms)          |
| **AST-Parser-Geschwindigkeit** | Massive Dateien (~5.000 Zeilen)          | **136.134 Zeilen/Sek** (Ø 38.6 ms)          |
| **Regelausführungszeit**       | RegEx / Manifest-Prüfungen               | **0.002 ms** (bis zu 493.827 Ops/Sek)       |
| **Regelausführungszeit**       | Vollständige AST-Inspektion              | **1.1 – 1.7 ms**                            |
| **End-to-End PR-Pipeline**     | Kleiner PR (3 Dateien, 161 Zeilen)       | **11.39 ms** (p95: 15.58 ms)                |
| **End-to-End PR-Pipeline**     | Monorepo-PR (100 Dateien, ~6.000 Zeilen) | **298.44 ms** (p95: 369.12 ms)              |
| **Webhook-HMAC-Verifizierung** | Fastify kryptografischer Vergleich       | **0.362 ms** (2.760 Req/Sek)                |
| **Genauigkeit (Recall)**       | Reales Testkorpus                        | **100.0%** (0 Fehlalarme bei sauberem Code) |

---

## Monorepo-Struktur

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

## Erste Schritte

### Voraussetzungen

- Node.js $\ge 20.0.0$
- pnpm $\ge 9.0.0$

### Installation & Build

```bash
git clone https://github.com/Ashutosh-Yadav-256/ArchStandards.git
cd ArchStandards

pnpm install

pnpm build

pnpm test

pnpm benchmark
```

### Lokal ausführen

```bash
pnpm --filter @archstandards/github-app start

pnpm --filter @archstandards/docs start
```

---

## Konfiguration (`.archstandards/config.yaml`)

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

## Mitwirken

Beiträge sind herzlich willkommen! Bitte lesen Sie [CONTRIBUTING.md](../../CONTRIBUTING.md) für Richtlinien und [SECURITY.md](../../SECURITY.md) für Sicherheitsmeldungen.

---

## Support & Kontakt

Bei Fragen wenden Sie sich gerne an: **[ashutosh4tech@gmail.com](mailto:ashutosh4tech@gmail.com)**.

---

## Lizenz

[MIT](../../LICENSE) © [Ashutosh Yadav](https://github.com/Ashutosh-Yadav-256)
