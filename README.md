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

Initialize with auto-detected defaults:

```bash
npx @tylercore/treg init
```

Preview changes only:

```bash
npx @tylercore/treg init --dry-run
```

Customize the setup interactively:

```bash
npx @tylercore/treg setup
```

Add one feature or package preset to an existing project:

```bash
npx @tylercore/treg add typescript
npx @tylercore/treg add zustand
```

---

## Commands

| Command | Description                                                       |
| ------- | ----------------------------------------------------------------- |
| `init`  | Auto-detect the project and apply the default infra baseline      |
| `setup` | Customize the infra baseline with an interactive flow             |
| `add`   | Add one feature or package preset and sync AI rules               |
| `list`  | Show supported frameworks, features, formatters, and test runners |

---

## Init Flow

During `init`, `Treg` auto-detects:

- package manager
- framework, in detection order `nuxt -> next -> react -> vue -> svelte -> node`

It then applies the default features:

- lint
- format
- TypeScript
- test
- husky
- AI rules guidance

The only prompt is whether to install default Packages for the detected framework. Selecting `Yes` installs the framework default package preset set and writes package-specific AI rules guidance. Selecting `No` skips package installation.

---

## Setup Interactive Flow

During `setup`, `Treg` asks for:

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

6. **Package installation**
   - `Yes`
   - `No`

7. **Packages** (only when package installation is selected)
   - Shared options for every framework, such as Zod and date-fns
   - Framework-specific options, such as Tailwind CSS, Zustand or Pinia, TanStack Query, TanStack Router, and framework i18n packages
   - You can leave this selection empty and continue.

Node.js is treated as a backend target, so its package list focuses on server, configuration, logging, and database tooling.

Selected packages are installed as dependencies or dev dependencies based on how they are used. When AI rules guidance is enabled, selected packages also add package-specific guidance to the selected AI rules files.

When using pnpm, Treg checks whether the existing `node_modules` is linked to a different pnpm store than the active pnpm version wants to use. If a store mismatch is detected, Treg stops and prints a rebuild hint instead of deleting files automatically. Rebuild `node_modules` manually with `rm -rf node_modules` and `pnpm install`, then rerun Treg.

---

## Add Flow

`add` installs one target at a time:

```bash
npx @tylercore/treg add typescript
npx @tylercore/treg add zustand
```

Supported feature targets:

- `lint`
- `format`
- `typescript`
- `test`
- `husky`

Package targets use the detected framework's preset list. For example, `add zustand` installs the framework-specific Zustand preset when the current project is React or Next.js. Unlike running the package manager directly, `add` also syncs the related AI rules guidance.

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

Customize setup:

```bash
npx @tylercore/treg setup
```

Add format using `oxfmt`:

```bash
npx @tylercore/treg add format --formatter oxfmt
```

Add test using `vitest`:

```bash
npx @tylercore/treg add test --test-runner vitest
```

Add Zustand and sync AI rules:

```bash
npx @tylercore/treg add zustand
```

---

## CLI Options

### `init`

```text
--dry-run
--help
```

### `setup`

```text
--dry-run
--help
```

### `add`

```text
add <lint|format|typescript|test|husky|package-preset>
--framework <node|react|next|vue|svelte|nuxt>
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

`Treg` checks the AI guidance files in the repository root:

| Tool   | File        |
| ------ | ----------- |
| Claude | `CLAUDE.md` |
| Codex  | `AGENTS.md` |
| Gemini | `GEMINI.md` |

Behavior:

- if `CLAUDE.md` or `GEMINI.md` contains `@AGENTS.md`, only `AGENTS.md` receives Treg guidance
- if any AI guidance file already exists and no file delegates to `@AGENTS.md`, only existing files are updated
- if none of the three files exist, Treg creates all three files, writes guidance to `AGENTS.md`, and writes `@AGENTS.md` to `CLAUDE.md` and `GEMINI.md`
- prompts are written directly into the target AI guidance document

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
