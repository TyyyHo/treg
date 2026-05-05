# @tylercore/treg

[![npm version](https://img.shields.io/npm/v/%40tylercore%2Ftreg)](https://www.npmjs.com/package/%40tylercore%2Ftreg)
[![npm downloads](https://img.shields.io/npm/dm/%40tylercore%2Ftreg)](https://www.npmjs.com/package/%40tylercore%2Ftreg)
[![License](https://img.shields.io/npm/l/%40tylercore%2Ftreg)](https://www.npmjs.com/package/%40tylercore%2Ftreg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)

## What is Treg?

Treg is a CLI tool that sets up code quality, tooling, and project standards for modern applications.

It injects an **engineering immune system** into your project.

When developers and AI collaborate under fast iteration, codebases tend to drift, leading to inconsistent tooling, duplicated rules, and fragile workflows.
Treg restores balance and keeps your repository **clean, maintainable, and extensible**.

Treg focuses on infrastructure setup (ESLint, Prettier, TypeScript, testing, hooks, AI guidance), not product logic.

---

## Features

`Treg` can configure:

- **TypeScript**
- **Linting** with ESLint
- **Formatting** with Prettier or Oxfmt
- **Testing** with Jest or Vitest
- **Git hooks** with Husky
- **AI rules guidance** for supported tools

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

Customize setup interactively:

```bash
npx @tylercore/treg setup
```

Add one feature or package preset:

```bash
npx @tylercore/treg add typescript
npx @tylercore/treg add zustand
```

When using pnpm, Treg stops with a rebuild hint if the existing `node_modules` is linked to a different pnpm store than the active pnpm version wants to use. It does not delete files automatically. Rebuild manually with `rm -rf node_modules` and `pnpm install`, then rerun Treg.

---

## Commands

| Command | Description                                                       |
| ------- | ----------------------------------------------------------------- |
| `init`  | Auto-detect the project and apply the default infra baseline      |
| `setup` | Customize the infra baseline with an interactive flow             |
| `add`   | Add one feature or package preset and sync AI rules               |
| `list`  | Show supported frameworks, features, formatters, and test runners |

---

## Common Usage

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

## Defaults

Framework detection order:

```text
nuxt -> next -> react -> vue -> svelte -> node
```

Default test runner:

- `vue` / `nuxt`: `vitest`
- others: `jest`

Default formatter:

```text
prettier
```

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

---

## Philosophy

`Treg` is intentionally narrow in scope.

It does not generate product architecture.
It establishes an engineering baseline that keeps repositories healthy during rapid iteration.
