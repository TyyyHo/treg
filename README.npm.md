# @tylercore/treg

[![npm
version](https://img.shields.io/npm/v/%40tylercore%2Ftreg)](https://www.npmjs.com/package/%40tylercore%2Ftreg)
[![npm
downloads](https://img.shields.io/npm/dm/%40tylercore%2Ftreg)](https://www.npmjs.com/package/%40tylercore%2Ftreg)
[![License](https://img.shields.io/npm/l/%40tylercore%2Ftreg)](https://www.npmjs.com/package/%40tylercore%2Ftreg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)

## Overview

**Treg** is a CLI tool that injects an **engineering immune system** into your project.

When humans and AI collaborate and iterate rapidly, repositories often
accumulate inconsistent tooling, style drift, and fragile workflows.\
`Treg` helps maintain balance by establishing a clean and consistent
development baseline.

It focuses only on **infrastructure setup**, not application logic.

---

## Features

`Treg` can configure:

- **TypeScript**
- **ESLint**
- **Prettier / Oxfmt**
- **Jest / Vitest**
- **Husky git hooks**
- **AI skill guidance**

These guardrails help maintain long‑term code health during fast
iteration.

---

## Quick Start

Initialize a project interactively:

```bash
npx @tylercore/treg init
```

Preview changes:

```bash
npx @tylercore/treg init --dry-run
```

---

## Commands

Command Description

---

`init` Initialize project with interactive setup
`add` Add selected features
`list` Show supported frameworks and tools

---

## Common Usage

Add lint and format:

```bash
npx @tylercore/treg add --features lint,format
```

Add format with `oxfmt`:

```bash
npx @tylercore/treg add --features format --formatter oxfmt
```

Add test with `vitest`:

```bash
npx @tylercore/treg add --features test --test-runner vitest
```

---

## Defaults

Framework detection order:

    nuxt -> next -> react -> vue -> svelte -> node

Default test runner:

- `vue` / `nuxt`: `vitest`
- others: `jest`

Default formatter:

    prettier

---

## AI Skills

`Treg` can update AI guidance files for development tools.

Tool File

---

Claude `CLAUDE.md`
Codex `AGENTS.md`
Gemini `GEMINI.md`

Behavior:

- only selected tools are updated
- missing files are created automatically
- updates occur in the repository root

---

## Philosophy

`Treg` is intentionally minimal.

It does not generate application architecture.\
It focuses only on establishing the engineering infrastructure that
keeps repositories healthy during rapid development.

---

## Release

Release package `@tylercore/treg`:

```bash
npm run release -- patch
```

Supported targets:

    patch
    minor
    major
    prepatch
    preminor
    premajor
    prerelease
    x.y.z
