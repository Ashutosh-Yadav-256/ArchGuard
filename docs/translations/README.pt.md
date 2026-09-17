[English](../../README.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Русский](README.ru.md) | [Français](README.fr.md) | [हिन्दी](README.hi.md) | [Español](README.es.md) | [Deutsch](README.de.md) | [Português](README.pt.md) | [العربية](README.ar.md)

---

# ArchStandards

> **Plataforma de governança de arquitetura como código (Policy-as-Code)**: avalia Pull Requests automaticamente de acordo com padrões de engenharia versionados, evita a erosão arquitetural e fornece feedback acionável baseado em árvore de sintaxe abstrata (AST).

[![CI](https://github.com/Ashutosh-Yadav-256/ArchStandards/actions/workflows/ci.yml/badge.svg)](https://github.com/Ashutosh-Yadav-256/ArchStandards/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../../LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-116%20passed-brightgreen)](https://vitest.dev/)
[![Coverage](https://img.shields.io/badge/Coverage-83.7%25-brightgreen)](https://github.com/Ashutosh-Yadav-256/ArchStandards)
[![Throughput](https://img.shields.io/badge/Parser%20Speed-145k%20lines%2Fs-orange)](#desempenho-e-benchmarks)

---

## O que é o ArchStandards?

Diretrizes de arquitetura mantidas em wikis ou páginas do Notion frequentemente ficam obsoletas, pois os desenvolvedores raramente dispõem de tempo para cruzar dados manuais durante revisões de código dinâmicas.

O **ArchStandards** preenche essa lacuna transformando seus manuais técnicos em verificações automatizadas de GitHub Checks:

- **Análise estática de AST**: Utiliza a API do TypeScript Compiler para inspeção sintática profunda, métricas de métodos/classes e grafo de dependências entre camadas.
- **Anotações inline no PR**: Insere explicações sobre não conformidades, motivações arquiteturais e sugestões de correção diretamente nas linhas alteradas do diff.
- **Pontuação de saúde arquitetural (0 - 100)**: Mensura de forma objetiva a saúde do PR e permite bloquear o merge perante violações críticas.
- **Guia de engenharia vivo e documentado**: Integração com portal Docusaurus que explica o racional de cada regra e como saná-la.
- **Exceções com prazo de expiração**: Gestão declarativa de dívida técnica em `.archstandards/config.yaml` com justificativa e validade obrigatórias.

---

## Arquitetura geral do sistema

```text
  Desenvolvedor abre / atualiza um PR
               │
               ▼
   [ Servidor Webhook Fastify ] ── Validação criptográfica segura HMAC-SHA256
               │
               ▼
    [ Camada Adaptador GitHub ] ── Obtenção de arquivos e diffs (Octokit)
               │
               ▼
      [ Núcleo ArchStandards Core ] ── Analisadores AST e classificador de arquivos
               │
        ┌──────┴──────┐
        ▼             ▼
   [ 18 Regras ] [ Exceções ]
        │             │
        └──────┬──────┘
               ▼
     [ Agregador de achados ] ──── Dedução de penalidades e cálculo do score
               │
               ▼
    [ API GitHub Check Run ] ───── Anotações nativas e relatório Markdown
```

---

## Catálogo das 18 regras integradas

| Domínio            | ID da Regra | Descrição do padrão                                                        | Severidade padrão |
| :----------------- | :---------- | :------------------------------------------------------------------------- | :---------------- |
| **Arquitetura**    | `ARCH-001`  | Controllers não devem importar repositórios diretamente (3 camadas)        | `error`           |
|                    | `ARCH-002`  | Controllers não devem conter lógica de negócio pesada (>20 linhas)         | `warning`         |
|                    | `ARCH-003`  | Serviços não devem depender de frameworks web HTTP (Express/Fastify)       | `error`           |
|                    | `ARCH-004`  | Dependências circulares entre módulos são estritamente proibidas           | `error`           |
| **Padrões de API** | `API-001`   | Endpoints devem definir validação de entrada (Zod, Joi)                    | `warning`         |
|                    | `API-002`   | Endpoints públicos devem declarar middleware de limitação de taxa          | `warning`         |
|                    | `API-003`   | Criações de recursos via POST devem retornar HTTP 201 Created              | `warning`         |
|                    | `API-004`   | Respostas de erro devem adotar formato estruturado (RFC 7807)              | `info`            |
| **Testes**         | `TEST-001`  | Novos arquivos de serviço exigem arquivos de testes unitários equivalentes | `error`           |
|                    | `TEST-002`  | Métodos com lógica complexa (>15 linhas) exigem testes dedicados           | `warning`         |
|                    | `TEST-003`  | O repositório deve manter ao menos 80% de proporção de testes              | `warning`         |
|                    | `TEST-004`  | É proibido desativar testes (`.skip`, `xit`) para aprovação em CI          | `error`           |
| **Segurança**      | `SEC-001`   | O código-fonte não deve conter chaves de API ou credenciais gravadas       | `error`           |
|                    | `SEC-002`   | Senhas e tokens de autenticação jamais devem ser gravados em logs          | `error`           |
|                    | `SEC-003`   | Conexões de banco de dados devem usar variáveis de ambiente                | `warning`         |
| **Nomenclatura**   | `NAME-001`  | Classes e interfaces devem utilizar PascalCase                             | `info`            |
|                    | `NAME-002`  | Funções e métodos de classe devem utilizar camelCase                       | `info`            |
|                    | `NAME-003`  | Variáveis booleanas devem usar prefixos afirmativos (`is`/`has`/`can`)     | `info`            |

---

## Desempenho e benchmarks

Aferido no Node.js v22 com cronômetros monotônicos de precisão (`performance.now()`):

| Teste de benchmark             | Escala                                 | Medição empírica                              |
| :----------------------------- | :------------------------------------- | :-------------------------------------------- |
| **Velocidade de análise AST**  | Arquivos pequenos (~100 linhas)        | **55.558 linhas/seg** (1.73 ms média)         |
| **Velocidade de análise AST**  | Arquivos grandes (~2.000 linhas)       | **145.214 linhas/seg** (14.5 ms média)        |
| **Velocidade de análise AST**  | Arquivos massivos (~5.000 linhas)      | **136.134 linhas/seg** (38.6 ms média)        |
| **Tempo de execução da regra** | Regex / Verificações de manifesto      | **0.002 ms** (até 493.827 ops/seg)            |
| **Tempo de execução da regra** | Varredura completa da AST              | **1.1 – 1.7 ms**                              |
| **Pipeline E2E de PR**         | PR pequeno (3 arquivos, 161 linhas)    | **11.39 ms** (p95: 15.58 ms)                  |
| **Pipeline E2E de PR**         | Monorepo (100 arquivos, ~6.000 linhas) | **298.44 ms** (p95: 369.12 ms)                |
| **Validação HMAC Webhook**     | Comparação em tempo constante Fastify  | **0.362 ms** (2.760 req/seg)                  |
| **Precisão de detecção**       | Corpus real de testes                  | **100.0%** (0 falso positivo em código limpo) |

---

## Estrutura do monorepositório

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

## Primeiros passos

### Pré-requisitos

- Node.js $\ge 20.0.0$
- pnpm $\ge 9.0.0$

### Instalação e compilação

```bash
git clone https://github.com/Ashutosh-Yadav-256/ArchStandards.git
cd ArchStandards

pnpm install

pnpm build

pnpm test

pnpm benchmark
```

### Execução local

```bash
pnpm --filter @archstandards/github-app start

pnpm --filter @archstandards/docs start
```

---

## Configuração (`.archstandards/config.yaml`)

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

## Contribuição

Contribuições são bem-vindas! Consulte [CONTRIBUTING.md](../../CONTRIBUTING.md) para fluxos de desenvolvimento e [SECURITY.md](../../SECURITY.md) para reporte de vulnerabilidades.

---

## Suporte e contato

Para esclarecer dúvidas ou obter suporte, contate: **[ashutosh4tech@gmail.com](mailto:ashutosh4tech@gmail.com)**.

---

## Licença

[MIT](../../LICENSE) © [Ashutosh Yadav](https://github.com/Ashutosh-Yadav-256)
