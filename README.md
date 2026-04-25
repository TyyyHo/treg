<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0F172A,30:1D4ED8,70:7C3AED,100:22C55E&height=260&section=header&text=Treg&fontSize=72&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Inject%20an%20immune%20system%20into%20your%20codebase&descSize=20&descAlignY=58" width="100%" />

# @tylercore/treg

[![npm version](https://img.shields.io/npm/v/%40tylercore%2Ftreg?style=flat-square)](https://www.npmjs.com/package/%40tylercore%2Ftreg)
[![License](https://img.shields.io/npm/l/%40tylercore%2Ftreg?style=flat-square)](https://www.npmjs.com/package/%40tylercore%2Ftreg)
[![npm downloads](https://img.shields.io/npm/dm/%40tylercore%2Ftreg?style=flat-square)](https://www.npmjs.com/package/%40tylercore%2Ftreg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)
![CLI](https://img.shields.io/badge/CLI-Interactive-111827?style=flat-square&logo=gnubash&logoColor=white)

[English](./README.md) | [繁體中文](./README.zh-hant.md) | [简体中文](./README.zh-hans.md) | [Español](./README.es.md) | [日本語](./README.ja.md)

</div>

---

## Overview

## What is Treg?

Treg is a CLI tool that sets up code quality, tooling, and project standards for modern applications.

It injects an **engineering immune system** into your project.

When developers and AI collaborate under fast iteration, codebases tend to drift—leading to inconsistent tooling, duplicated rules, and fragile workflows.  
Treg acts like a regulatory T cell: it restores balance, suppresses unnecessary chaos, and keeps your repository **clean, maintainable, and extensible**.

Instead of generating application logic, Treg focuses on the engineering baseline—configuring tools like ESLint, Prettier, and TypeScript to protect your project from long-term entropy.

> **Regulate the workflow before the workflow regulates you.**

---

## Why Treg

Modern projects can move fast, especially with AI-assisted coding.  
But speed without constraints often creates invisible damage:

- style drift
- inconsistent tooling
- weak commit hygiene
- missing tests
- unclear AI usage rules

`Treg` solves that by applying a consistent baseline to an existing repository with a single initialization flow.

---

## What Treg Sets Up

`Treg` can configure:

- **TypeScript**
- **Linting** with ESLint
- **Formatting** with Prettier or Oxfmt
- **Testing** with Jest or Vitest
- **Git hooks** with Husky
- **AI rules guidance** for supported tools

This keeps the project stable without forcing application-level architecture decisions.

---

## Quick Start

Initialize interactively:

```bash
npx @tylercore/treg init
```

Preview changes only:

```bash
npx @tylercore/treg init --dry-run
```

Add features to an existing project:

```bash
npx @tylercore/treg add
```

---

## Commands

| Command | Description                                                       |
| ------- | ----------------------------------------------------------------- |
| `init`  | Initialize the project with an interactive setup flow             |
| `add`   | Add selected features to an existing project                      |
| `list`  | Show supported frameworks, features, formatters, and test runners |

---

## Init Interactive Flow

During `init`, `Treg` asks for:

1. **Package manager**  
   `pnpm | npm | yarn | bun`

2. **Features** (multi-select, selected by default)
   - lint
   - format
   - TypeScript
   - test
   - husky
   - AI rules guidance

3. **Test runner** (only when `test` is selected)
   - `jest`
   - `vitest`
   - `skip`

4. **Formatter** (only when `format` is selected)
   - `prettier`
   - `oxfmt`

5. **AI tools** (only when AI rules guidance is selected)
   - Claude
   - Codex
   - Gemini

---

## Add Interactive Flow

During `add`, `Treg` asks for:

1. **Features** (multi-select)
   - lint
   - format
   - TypeScript
   - test
   - husky
   - AI rules guidance (only when an AI rules file already exists)

2. **Formatter** (only when `format` is selected)
   - `prettier`
   - `oxfmt`

3. **Test runner** (only when `test` is selected)
   - `jest`
   - `vitest`
   - `skip`

4. **AI tools** (only when AI rules guidance is selected)
   - Claude
   - Codex
   - Gemini

---

## Common Usage

Initialize project:

```bash
npx @tylercore/treg init
```

Preview init plan only:

```bash
npx @tylercore/treg init --dry-run
```

Add only lint + format:

```bash
npx @tylercore/treg add
```

Then select `lint` and `format`.

Add format using `oxfmt`:

```bash
npx @tylercore/treg add
```

Then select `format`, then `oxfmt`.

Add test using `vitest`:

```bash
npx @tylercore/treg add
```

Then select `test`, then `vitest`.

---

## CLI Options

### `init`

```text
--dry-run
--help
```

### `add`

Interactive mode:

```text
add
```

Optional automation flags:

```text
--framework <node|react|next|vue|svelte|nuxt>
--features <lint,format,typescript,test,husky>
--dir <path>
--formatter <prettier|oxfmt>
--test-runner <jest|vitest>
--force
--dry-run
--skip-husky-install
--help
```

---

## Defaults

### Framework Detection

Detection order:

```text
nuxt -> next -> react -> vue -> svelte -> node
```

### Test Runner

- `vue` / `nuxt`: `vitest`
- others: `jest`

### Formatter

- `prettier`

---

## AI Rules Behavior

`Treg` can update AI guidance files for selected tools:

| Tool   | File        |
| ------ | ----------- |
| Claude | `CLAUDE.md` |
| Codex  | `AGENTS.md` |
| Gemini | `GEMINI.md` |

Behavior:

- only selected tools are updated
- selected docs are created automatically when missing
- updates happen in the repository root
- prompts are written directly inside each selected AI guidance document

---

## Philosophy

`Treg` is intentionally narrow in scope.

It does **not** try to be a full project generator.  
It does **not** replace team judgment.  
It does **not** force product architecture.

It exists to establish the engineering immune layer that keeps rapid iteration from degrading the codebase over time.

---

<div align="center">
  <sub>Built to regulate chaotic iteration and protect long-term codebase health.</sub>
  <br />
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:22C55E,40:06B6D4,75:3B82F6,100:7C3AED&height=120&section=footer" width="100%" />
</div>
