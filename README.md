<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0F172A,30:1D4ED8,70:7C3AED,100:22C55E&height=260&section=header&text=treg&fontSize=72&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Inject%20an%20immune%20system%20into%20your%20codebase&descSize=20&descAlignY=58" width="100%" />

# @tyyyho/treg

[![npm version](https://img.shields.io/npm/v/%40tyyyho%2Ftreg?style=for-the-badge)](https://www.npmjs.com/package/%40tyyyho%2Ftreg)
[![License](https://img.shields.io/npm/l/%40tyyyho%2Ftreg?style=for-the-badge)](https://www.npmjs.com/package/%40tyyyho%2Ftreg)
[![npm downloads](https://img.shields.io/npm/dm/%40tyyyho%2Ftreg?style=for-the-badge)](https://www.npmjs.com/package/%40tyyyho%2Ftreg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![CLI](https://img.shields.io/badge/CLI-Interactive-111827?style=for-the-badge&logo=gnubash&logoColor=white)

[繁體中文 README](./README.zh-hant.md)

</div>

---

## Overview

**treg**

It is a CLI tool designed to inject an **"immune system"** into your project.  
When Developer and AI collaborate at high speed, codebases can drift into inconsistency, duplicated rules, and fragile workflows.  
`treg` plays the role of a regulatory T cell: it helps restore balance, suppress avoidable chaos, and keep the repository **clean, maintainable, and extensible**.

Instead of generating app logic, `treg` focuses on the engineering baseline that protects a project from long-term entropy.

> **Regulate the workflow before the workflow regulates you.**

---

## Why treg

Modern projects can move fast, especially with AI-assisted coding.  
But speed without constraints often creates invisible damage:

- style drift
- inconsistent tooling
- weak commit hygiene
- missing tests
- unclear AI usage rules

`treg` solves that by applying a consistent baseline to an existing repository with a single initialization flow.

---

## What treg Sets Up

`treg` can configure:

- **TypeScript**
- **Linting** with ESLint
- **Formatting** with Prettier or Oxfmt
- **Testing** with Jest or Vitest
- **Git hooks** with Husky
- **AI skill guidance** for supported tools

This keeps the project stable without forcing application-level architecture decisions.

---

## Quick Start

Initialize interactively:

```bash
npx @tyyyho/treg init
```

Preview changes only:

```bash
npx @tyyyho/treg init --dry-run
```

Add features to an existing project:

```bash
npx @tyyyho/treg add --features lint,format
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

During `init`, `treg` asks for:

1. **Package manager**  
   `pnpm | npm | yarn | bun`

2. **Features** (multi-select, selected by default)
   - lint
   - format
   - TypeScript
   - test
   - husky
   - AI skill guidance

3. **Test runner** (only when `test` is selected)
   - `jest`
   - `vitest`
   - `skip`

4. **Formatter** (only when `format` is selected)
   - `prettier`
   - `oxfmt`

5. **AI tools** (only when AI skill guidance is selected)
   - Claude
   - Codex
   - Gemini

---

## Common Usage

Initialize project:

```bash
npx @tyyyho/treg init
```

Preview init plan only:

```bash
npx @tyyyho/treg init --dry-run
```

Add only lint + format:

```bash
npx @tyyyho/treg add --features lint,format
```

Add format using `oxfmt`:

```bash
npx @tyyyho/treg add --features format --formatter oxfmt
```

Add test using `vitest`:

```bash
npx @tyyyho/treg add --features test --test-runner vitest
```

---

## CLI Options

### `init`

```text
--dry-run
--help
```

### `add`

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

## AI Skills Behavior

`treg` can update AI guidance files for selected tools:

| Tool   | File        |
| ------ | ----------- |
| Claude | `CLAUDE.md` |
| Codex  | `AGENTS.md` |
| Gemini | `GEMINI.md` |

Behavior:

- only selected tools are updated
- selected docs are created automatically when missing
- updates happen in the repository root
- skill files are generated once per enabled feature

---

## Philosophy

`treg` is intentionally narrow in scope.

It does **not** try to be a full project generator.  
It does **not** replace team judgment.  
It does **not** force product architecture.

It exists to establish the engineering immune layer that keeps rapid iteration from degrading the codebase over time.

---

## Release

```bash
npm run release -- patch
```

Supported targets:

```text
patch
minor
major
prepatch
preminor
premajor
prerelease
x.y.z
```

---

<div align="center">
  <sub>Built to regulate chaotic iteration and protect long-term codebase health.</sub>
  <br />
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:22C55E,40:06B6D4,75:3B82F6,100:7C3AED&height=120&section=footer" width="100%" />
</div>
