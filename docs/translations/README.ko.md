[English](../../README.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [한국어](README.ko.md) | [Русский](README.ru.md) | [Français](README.fr.md) | [हिन्दी](README.hi.md) | [Español](README.es.md) | [Deutsch](README.de.md) | [Português](README.pt.md) | [العربية](README.ar.md)

---

# ArchStandards

> **코드형 정책(Policy-as-Code) 아키텍처 거버넌스 플랫폼**: 버전 관리되는 엔지니어링 표준을 기반으로 풀 리퀘스트를 자동 검토하고, 아키텍처 침식을 방지하며, AST 기반의 실행 가능한 피드백을 엔지니어링 팀에 제공합니다.

[![CI](https://github.com/Ashutosh-Yadav-256/ArchStandards/actions/workflows/ci.yml/badge.svg)](https://github.com/Ashutosh-Yadav-256/ArchStandards/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../../LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-116%20passed-brightgreen)](https://vitest.dev/)
[![Coverage](https://img.shields.io/badge/Coverage-83.7%25-brightgreen)](https://github.com/Ashutosh-Yadav-256/ArchStandards)
[![Throughput](https://img.shields.io/badge/Parser%20Speed-145k%20lines%2Fs-orange)](#성능-및-벤치마크)

---

## ArchStandards란 무엇인가요?

위키나 노션의 아키텍처 문서는 빠른 템포의 코드 리뷰 과정에서 간과되기 쉬우며 시간이 지남에 따라 점차 효력을 잃습니다.

**ArchStandards**는 엔지니어링 표준 문서를 지속적이고 자동화된 GitHub Checks로 변환하여 이 간극을 메웁니다:

- **정적 AST 분석**: TypeScript 컴파일러 API를 활용하여 심층 구문 분석, 클래스/메서드 메트릭 및 계층 간 import 관계 그래프를 검사합니다.
- **인라인 PR 주석**: 위반 사유, 원칙 및 권장 코드 수정안을 변경된 diff 라인에 직접 등록합니다.
- **아키텍처 건전성 점수 (0 - 100)**: PR의 품질을 객관적으로 채점하며 설정에 따라 머지를 차단할 수 있습니다.
- **살아있는 문서 플레이북**: 규칙의 존재 이유와 해결 가이드를 설명하는 Docusaurus 사이트와 긴밀히 연동됩니다.
- **만료 기한이 있는 아키텍처 예외**: `.archstandards/config.yaml`을 통해 사유와 만료일을 명시하여 기술 부채를 체계적으로 관리합니다.

---

## 시스템 아키텍처 개요

```text
  개발자가 PR 생성 / 업데이트
               │
               ▼
   [ Fastify Webhook 서버 ] ── HMAC-SHA256 타이밍 세이프 검증
               │
               ▼
    [ GitHub 어댑터 계층 ] ─── 변경 파일 및 Diff 수신 (Octokit)
               │
               ▼
      [ ArchStandards 코어 ] ────── AST 파서 및 파일 분류기
               │
        ┌──────┴──────┐
        ▼             ▼
   [ 18개 규칙 ]  [ 예외 필터 ]
        │             │
        └──────┬──────┘
               ▼
     [ 결과 집계 엔진 ] ────── 감점 계산 및 아키텍처 건전성 점수 산출
               │
               ▼
    [ GitHub Check Run API ] ─ 인라인 어노테이션 및 상세 마크다운 보고서
```

---

## 18개 내장 규칙 카탈로그

| 도메인        | 규칙 ID    | 표준 명세                                                                | 기본 심각도 |
| :------------ | :--------- | :----------------------------------------------------------------------- | :---------- |
| **아키텍처**  | `ARCH-001` | 컨트롤러는 레포지토리를 직접 import해서는 안 됩니다                      | `error`     |
|               | `ARCH-002` | 컨트롤러에 과도한 비즈니스 로직(메서드당 20줄 초과)이 있어서는 안 됩니다 | `warning`   |
|               | `ARCH-003` | 서비스 계층은 HTTP/웹 프레임워크에 의존해서는 안 됩니다                  | `error`     |
|               | `ARCH-004` | 모듈 간 순환 참조는 엄격히 금지됩니다                                    | `error`     |
| **API 표준**  | `API-001`  | 엔드포인트는 요청 입력값 검증(Zod, Joi 등)을 정의해야 합니다             | `warning`   |
|               | `API-002`  | 공개 엔드포인트는 레이트 리미트 미들웨어를 선언해야 합니다               | `warning`   |
|               | `API-003`  | POST 리소스 생성 엔드포인트는 HTTP 201 Created를 반환해야 합니다         | `warning`   |
|               | `API-004`  | 에러 응답은 표준화된 구조(RFC 7807)를 준수해야 합니다                    | `info`      |
| **테스트**    | `TEST-001` | 신규 서비스 파일은 반드시 대응하는 단위 테스트 파일이 필요합니다         | `error`     |
|               | `TEST-002` | 복잡한 비즈니스 로직(15줄 초과 메서드)은 전용 테스트가 필요합니다        | `warning`   |
|               | `TEST-003` | 저장소는 최소 80% 이상의 테스트 파일 비율을 유지해야 합니다              | `warning`   |
|               | `TEST-004` | CI 통과를 위해 테스트를 스킵(`.skip`, `xit`)할 수 없습니다               | `error`     |
| **보안**      | `SEC-001`  | 소스 코드에 API 키, 토큰, 비밀번호를 하드코딩해서는 안 됩니다            | `error`     |
|               | `SEC-002`  | 비밀번호나 토큰 등 민감한 인증 정보를 로그에 출력해서는 안 됩니다        | `error`     |
|               | `SEC-003`  | 데이터베이스 연결 문자열은 환경 변수를 사용해야 합니다                   | `warning`   |
| **명명 규칙** | `NAME-001` | 클래스 및 인터페이스 이름은 PascalCase를 따라야 합니다                   | `info`      |
|               | `NAME-002` | 함수 및 클래스 메서드 이름은 camelCase를 따라야 합니다                   | `info`      |
|               | `NAME-003` | 불리언 변수 및 속성은 긍정 접두사(`is`/`has`/`can`)를 사용해야 합니다    | `info`      |

---

## 성능 및 벤치마크

Node.js v22 환경에서 단조 타이머(`performance.now()`)를 활용한 실측치:

| 벤치마크 항목            | 규모 / 메트릭                    | 실측 성능                         |
| :----------------------- | :------------------------------- | :-------------------------------- |
| **AST 파서 속도**        | 소형 파일 (~100줄)               | **55,558 줄/초** (평균 1.73 ms)   |
| **AST 파서 속도**        | 대형 파일 (~2,000줄)             | **145,214 줄/초** (평균 14.5 ms)  |
| **AST 파서 속도**        | 초대형 파일 (~5,000줄)           | **136,134 줄/초** (평균 38.6 ms)  |
| **규칙 실행 지연시간**   | 정규표현식 / 매니페스트 검사     | **0.002 ms** (최대 493,827 회/초) |
| **규칙 실행 지연시간**   | 전체 AST 탐색 규칙               | **1.1 – 1.7 ms**                  |
| **E2E PR 파이프라인**    | 소규모 PR (3개 파일, 161줄)      | **11.39 ms** (p95: 15.58 ms)      |
| **E2E PR 파이프라인**    | 대규모 PR (100개 파일, ~6,000줄) | **298.44 ms** (p95: 369.12 ms)    |
| **웹훅 HMAC 검증**       | Fastify 암호화 검증              | **0.362 ms** (2,760 req/초)       |
| **탐지 정확도 (재현율)** | 실제 테스트 코드 코퍼스          | **100.0%** (정상 코드 오탐 0건)   |

---

## 모노레포 구조

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

## 시작하기

### 필수 요구사항

- Node.js $\ge 20.0.0$
- pnpm $\ge 9.0.0$

### 설치 및 빌드

```bash
git clone https://github.com/Ashutosh-Yadav-256/ArchStandards.git
cd ArchStandards

pnpm install

pnpm build

pnpm test

pnpm benchmark
```

### 로컬 실행

```bash
pnpm --filter @archstandards/github-app start

pnpm --filter @archstandards/docs start
```

---

## 설정 파일 (`.archstandards/config.yaml`)

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

## 기여하기

기여를 환영합니다! 개발 워크플로우는 [CONTRIBUTING.md](../../CONTRIBUTING.md)를, 보안 취약점 보고는 [SECURITY.md](../../SECURITY.md)를 확인해주세요.

---

## 지원 및 문의

궁금한 점이나 기술 지원이 필요하시면 **[ashutosh4tech@gmail.com](mailto:ashutosh4tech@gmail.com)** 으로 문의해 주세요.

---

## 라이선스

[MIT](../../LICENSE) © [Ashutosh Yadav](https://github.com/Ashutosh-Yadav-256)
