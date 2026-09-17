[English](../../README.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Русский](README.ru.md) | [Français](README.fr.md) | [हिन्दी](README.hi.md) | [Español](README.es.md) | [Deutsch](README.de.md) | [Português](README.pt.md) | [العربية](README.ar.md)

---

# ArchStandards

> **Plateforme de gouvernance d'architecture en Policy-as-Code** : analyse automatiquement les Pull Requests par rapport à des standards d'ingénierie versionnés, prévient l'érosion architecturale et fournit aux équipes de développement des retours exploitables basés sur l'arbre syntaxique abstrait (AST).

[![CI](https://github.com/Ashutosh-Yadav-256/ArchStandards/actions/workflows/ci.yml/badge.svg)](https://github.com/Ashutosh-Yadav-256/ArchStandards/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../../LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-116%20passed-brightgreen)](https://vitest.dev/)
[![Coverage](https://img.shields.io/badge/Coverage-83.7%25-brightgreen)](https://github.com/Ashutosh-Yadav-256/ArchStandards)
[![Throughput](https://img.shields.io/badge/Parser%20Speed-145k%20lines%2Fs-orange)](#performances-et-benchmarks)

---

## Qu'est-ce qu'ArchStandards ?

La documentation architecturale consignée dans des wikis ou des pages Notion devient souvent obsolète, car les développeurs manquent de temps pour recouper manuellement ces règles statiques lors des revues de code rapides.

**ArchStandards** comble ce fossé en transformant votre guide d'ingénierie en vérifications GitHub Checks automatisées :

- **Analyse AST statique** : Utilise l'API du compilateur TypeScript pour l'inspection syntaxique approfondie, le calcul des métriques de méthodes/classes et les graphes d'importation entre couches.
- **Annotations inline sur la PR** : Épinglage des explications, des principes directeurs et des suggestions de correctifs directement sur les lignes modifiées.
- **Score de santé architecturale (0 - 100)** : Évalue objectivement la qualité du code et peut bloquer la fusion en cas de dette critique.
- **Playbook interactif documenté** : Intégration complète avec un site Docusaurus détaillant les raisons de chaque règle et les solutions de remédiation.
- **Exceptions d'architecture expirables** : Gestion déclarative de la dette technique dans `.archstandards/config.yaml` avec justification obligatoire et date d'expiration.

---

## Architecture globale

```text
  Développeur crée / met à jour une PR
               │
               ▼
   [ Serveur Webhook Fastify ] ── Vérification sécurisée HMAC-SHA256
               │
               ▼
    [ Couche Adaptateur GitHub ] ─ Récupération des fichiers et diffs (Octokit)
               │
               ▼
      [ Moteur ArchStandards Core ] ── Parseurs AST et classificateur de fichiers
               │
        ┌──────┴──────┐
        ▼             ▼
   [ 18 Règles ] [ Exceptions ]
        │             │
        └──────┬──────┘
               ▼
     [ Agrégateur de résultats ] ─ Déductions et calcul du score de santé
               │
               ▼
    [ API GitHub Check Run ] ──── Annotations natives et rapport Markdown
```

---

## Catalogue des 18 règles intégrées

| Domaine             | ID Règle   | Description du standard                                                       | Sévérité par défaut |
| :------------------ | :--------- | :---------------------------------------------------------------------------- | :------------------ |
| **Architecture**    | `ARCH-001` | Les contrôleurs ne doivent pas importer directement les dépôts (3 tiers)      | `error`             |
|                     | `ARCH-002` | Les contrôleurs ne doivent pas contenir de logique métier lourde (>20 lignes) | `warning`           |
|                     | `ARCH-003` | Les services ne doivent pas dépendre de frameworks web HTTP                   | `error`             |
|                     | `ARCH-004` | Les dépendances circulaires entre modules sont interdites                     | `error`             |
| **Standards d'API** | `API-001`  | Les points de terminaison doivent valider les entrées (Zod, Joi)              | `warning`           |
|                     | `API-002`  | Les routes publiques doivent déclarer un middleware de limitation de débit    | `warning`           |
|                     | `API-003`  | Les créations de ressources POST doivent renvoyer HTTP 201 Created            | `warning`           |
|                     | `API-004`  | Les réponses d'erreur doivent suivre le schéma RFC 7807                       | `info`              |
| **Tests**           | `TEST-001` | Tout nouveau service requiert un fichier de test unitaire associé             | `error`             |
|                     | `TEST-002` | La logique métier critique (>15 lignes) nécessite des tests dédiés            | `warning`           |
|                     | `TEST-003` | Le projet doit maintenir au minimum 80% de couverture de fichiers de test     | `warning`           |
|                     | `TEST-004` | Il est interdit d'ignorer des tests (`.skip`, `xit`) pour passer la CI        | `error`             |
| **Sécurité**        | `SEC-001`  | Le code source ne doit pas contenir de clés d'API ou mots de passe en dur     | `error`             |
|                     | `SEC-002`  | Les mots de passe et jetons ne doivent jamais être inscrits dans les logs     | `error`             |
|                     | `SEC-003`  | Les chaînes de connexion BDD doivent utiliser des variables d'environnement   | `warning`           |
| **Nommage**         | `NAME-001` | Les classes et interfaces doivent utiliser PascalCase                         | `info`              |
|                     | `NAME-002` | Les fonctions et méthodes doivent adopter camelCase                           | `info`              |
|                     | `NAME-003` | Les booléens doivent utiliser un préfixe affirmatif (`is`/`has`/`can`)        | `info`              |

---

## Performances et benchmarks

Mesures effectuées sur Node.js v22 avec minuteurs de haute précision (`performance.now()`) :

| Test de performance              | Échelle                                | Mesure empirique                            |
| :------------------------------- | :------------------------------------- | :------------------------------------------ |
| **Débit du parseur AST**         | Petits fichiers (~100 lignes)          | **55 558 lignes/sec** (1.73 ms moyen)       |
| **Débit du parseur AST**         | Fichiers volumineux (~2 000 lignes)    | **145 214 lignes/sec** (14.5 ms moyen)      |
| **Débit du parseur AST**         | Fichiers massifs (~5 000 lignes)       | **136 134 lignes/sec** (38.6 ms moyen)      |
| **Latence d'exécution de règle** | Regex / Contrôle manifeste             | **0.002 ms** (jusqu'à 493 827 ops/sec)      |
| **Latence d'exécution de règle** | Traversée complète de l'AST            | **1.1 – 1.7 ms**                            |
| **Pipeline PR de bout en bout**  | Petite PR (3 fichiers, 161 lignes)     | **11.39 ms** (p95: 15.58 ms)                |
| **Pipeline PR de bout en bout**  | Monorepo (100 fichiers, ~6 000 lignes) | **298.44 ms** (p95: 369.12 ms)              |
| **Vérification HMAC Webhook**    | Comparaison cryptographique sécurisée  | **0.362 ms** (2 760 req/sec)                |
| **Taux de détection (Rappel)**   | Corpus de tests réels                  | **100.0%** (0 faux positif sur code propre) |

---

## Structure du monorepo

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

## Prise en main

### Prérequis

- Node.js $\ge 20.0.0$
- pnpm $\ge 9.0.0$

### Installation et compilation

```bash
git clone https://github.com/Ashutosh-Yadav-256/ArchStandards.git
cd ArchStandards

pnpm install

pnpm build

pnpm test

pnpm benchmark
```

### Exécution locale

```bash
pnpm --filter @archstandards/github-app start

pnpm --filter @archstandards/docs start
```

---

## Configuration (`.archstandards/config.yaml`)

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

## Contribution

Les contributions sont chaleureusement bienvenues ! Consultez [CONTRIBUTING.md](../../CONTRIBUTING.md) pour les instructions de développement et [SECURITY.md](../../SECURITY.md) pour la divulgation des vulnérabilités.

---

## Support et contact

Pour toute question ou demande de support, contactez : **[ashutosh4tech@gmail.com](mailto:ashutosh4tech@gmail.com)**.

---

## Licence

[MIT](../../LICENSE) © [Ashutosh Yadav](https://github.com/Ashutosh-Yadav-256)
