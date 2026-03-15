# @tyyyho/treg

[繁體中文 README](./README.zh-hant.md)

`treg` is a CLI for applying project tooling standards to an existing repository.

It focuses on infrastructure setup only:

- lint
- format
- TypeScript
- test
- husky
- AI skill guidance

## Why Use treg

`treg` helps teams enforce a consistent baseline quickly without manually wiring every tool in each repo.

Use it when you want to:

- bootstrap tooling in an existing project
- apply only selected setup items
- keep runs repeatable and safe (`idempotent`)
- preview changes before writing files (`--dry-run`)

## Quick Start

```bash
npx @tyyyho/treg init
```

```bash
pnpm dlx @tyyyho/treg init
```

## Command Overview

- `init`: Apply infra rules with framework auto-detection.
- `add`: Apply only selected features.
- `list`: Show supported frameworks, features, formatters, and test runners.

## Common Usage

Initialize with auto-detection:

```bash
npx @tyyyho/treg init
```

Initialize with explicit framework:

```bash
npx @tyyyho/treg init --framework react
```

Apply only lint + format:

```bash
npx @tyyyho/treg add --features lint,format
```

Use `oxfmt` for formatting:

```bash
npx @tyyyho/treg add --features format --formatter oxfmt
```

Skip format/test setup to keep existing project config untouched:

```bash
npx @tyyyho/treg add --no-format --no-test-runner
```

Preview plan without writing files:

```bash
npx @tyyyho/treg init --framework react --dry-run
```

Target a specific directory:

```bash
npx @tyyyho/treg init --framework react --dir ./packages/web
```

## Key Defaults

Framework detection order:

`nuxt -> next -> react -> vue -> svelte -> node`

Test runner defaults:

- `vue` / `nuxt`: `vitest`
- others: `jest`

Formatter default:

- `prettier` (override with `--formatter oxfmt`)

## CLI Options

```text
--framework <node|react|next|vue|svelte|nuxt>
--features <lint,format,typescript,test,husky>
--no-format
--no-test-runner
--dir <path>
--formatter <prettier|oxfmt>
--test-runner <jest|vitest>
--pm <pnpm|npm|yarn|auto>
--force
--dry-run
--skip-husky-install
--skills
--no-skills
--help
```

## AI Skills Behavior

When skills are enabled:

- `treg` updates existing `CLAUDE.md`, `AGENTS.md`, and/or `GEMINI.md` if present.
- `treg` does not create those files when they do not exist.

## Release

```bash
pnpm release patch
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
