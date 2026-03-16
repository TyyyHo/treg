# @tyyyho/Treg

[![npm version](https://img.shields.io/npm/v/%40tyyyho%2Ftreg)](https://www.npmjs.com/package/%40tyyyho%2Ftreg)
[![License](https://img.shields.io/npm/l/%40tyyyho%2Ftreg)](https://www.npmjs.com/package/%40tyyyho%2Ftreg)
[![npm downloads](https://img.shields.io/npm/dm/%40tyyyho%2Ftreg)](https://www.npmjs.com/package/%40tyyyho%2Ftreg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)

[繁體中文 README](./README.zh-hant.md)

Treg (Regulatory T Cell) is a CLI tool that injects an "immune system" into your project.
When people and AI collaborate and iterate quickly, code can easily lose order and consistency; `treg` acts like biological T cells to maintain balance and suppress chaos, so your project stays clean, maintainable, and extensible during rapid iteration.

With one-time initialization, `treg` establishes a stable engineering baseline for existing repositories, including TypeScript, ESLint, Prettier, Husky, and standardized conventions. This gives your workflow foundational "immune protection" and prevents errors and style drift from continuously accumulating.
It only handles infrastructure setup:

- lint
- format
- TypeScript
- test
- husky
- AI skill guidance

## Quick Start

```bash
npx @tyyyho/Treg init
```

## Commands

- `init`: Initialize.
- `add`: Add selected features to an existing project.
- `list`: Show supported frameworks/features/formatters/test runners.

## Init Interactive Flow

After `init`, `treg` asks:

1. Package manager (`pnpm|npm|yarn|bun`)
2. Features (multi-select, all options selected by default)
3. Test runner (only when `test` is selected, supports `skip`)
4. Formatter (only when `format` is selected)
5. AI tools (`Claude|Codex|Gemini`, multi-select, only when AI skill guidance is selected)

Default selected features include:

- lint
- format
- TypeScript
- test
- husky
- AI skill guidance

## Common Usage

Initialize with interactive prompts:

```bash
npx @tyyyho/Treg init
```

Preview init plan only:

```bash
npx @tyyyho/Treg init --dry-run
```

Add only lint + format:

```bash
npx @tyyyho/Treg add --features lint,format
```

Add format using `oxfmt`:

```bash
npx @tyyyho/Treg add --features format --formatter oxfmt
```

Add test using `vitest`:

```bash
npx @tyyyho/Treg add --features test --test-runner vitest
```

## CLI Options

`init` options:

```text
--dry-run
--help
```

`add` options:

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

## Defaults

Framework detection order:

`nuxt -> next -> react -> vue -> svelte -> node`

Test runner default:

- `vue` / `nuxt`: `vitest`
- others: `jest`

Formatter default:

- `prettier`

## AI Skills Behavior

- AI guidance updates only selected tools' files:
  - `Claude -> CLAUDE.md`
  - `Codex -> AGENTS.md`
  - `Gemini -> GEMINI.md`
- Files are updated when they exist in repo root.
- Missing selected AI docs are auto-created before injecting guidance.
- Skill files are generated once per enabled feature.

## Release

```bash
npm run release -- patch
```

Supported targets:

- `patch`
- `minor`
- `major`
- `prepatch`
- `preminor`
- `premajor`
- `prerelease`
- explicit version (`x.y.z`)
