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

Initialize interactively:

```bash
npx @tylercore/treg init
```

Preview changes only:

```bash
npx @tylercore/treg init --dry-run
```

Add selected features to an existing project:

```bash
npx @tylercore/treg add --features lint,format
```

---

## Commands

| Command | Description                                                       |
| ------- | ----------------------------------------------------------------- |
| `init`  | Initialize the project with an interactive setup flow             |
| `add`   | Add selected features to an existing project                      |
| `list`  | Show supported frameworks, features, formatters, and test runners |

---

## Common Usage

Add only lint + format:

```bash
npx @tylercore/treg add --features lint,format
```

Add format using `oxfmt`:

```bash
npx @tylercore/treg add --features format --formatter oxfmt
```

Add test using `vitest`:

```bash
npx @tylercore/treg add --features test --test-runner vitest
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

`Treg` can update AI guidance files for selected tools:

| Tool   | File        |
| ------ | ----------- |
| Claude | `CLAUDE.md` |
| Codex  | `AGENTS.md` |
| Gemini | `GEMINI.md` |

Behavior:

- only selected tools are updated
- missing files are created automatically
- updates happen in the repository root

---

## Philosophy

`Treg` is intentionally narrow in scope.

It does not generate product architecture.
It establishes an engineering baseline that keeps repositories healthy during rapid iteration.
