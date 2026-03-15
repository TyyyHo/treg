# @tyyyho/treg

[繁體中文 README](./README.zh-hant.md)

`treg` is a CLI for quickly setting up project tooling conventions in an existing repository.
It applies infra setup such as lint, format, TypeScript, test, husky, and AI skill guidance.

## Quick Start

```bash
pnpm dlx @tyyyho/treg init
# or
npx @tyyyho/treg init
```

`init` auto-detects framework from dependencies.

## Commands

```bash
npx @tyyyho/treg <command> [options]
```

- `init`: Initialize infra rules (framework auto-detected from dependencies)
- `add`: Add selected infra features to an existing project
- `list`: List supported frameworks, features, and test runners

## Options

- `--framework <node|react|next|vue|svelte|nuxt>`: Optional framework override
- `--features <lint,format,typescript,test,husky>`: Features to install (defaults to all)
- `--dir <path>`: Target directory (defaults to current directory)
- `--test-runner <jest|vitest>`: Optional test runner override when test feature is enabled
- `--pm <pnpm|npm|yarn|auto>`: Package manager (auto-detected by default)
- `--force`: Overwrite existing config files
- `--dry-run`: Print full plan without writing files
- `--skip-husky-install`: Skip husky install command
- `--skills`: Update existing `CLAUDE.md`/`AGENTS.md`/`GEMINI.md` with skill guidance (enabled by default)
- `--no-skills`: Disable skill guidance updates
- `--help`: Show help

## Features

Default feature set:

- `husky`
- `typescript`
- `lint`
- `format`
- `test`

## Examples

Initialize with auto-detected framework:

```bash
npx @tyyyho/treg init
```

Initialize with explicit framework override:

```bash
npx @tyyyho/treg init --framework react
```

Add only lint + format:

```bash
npx @tyyyho/treg add --features lint,format
```

Use Vitest for test feature:

```bash
npx @tyyyho/treg init --framework node --features test --test-runner vitest
```

Preview changes only:

```bash
npx @tyyyho/treg init --framework react --dry-run
```

Update AI skill guidance:

```bash
npx @tyyyho/treg add --features lint,format,husky
```

Target a different directory explicitly:

```bash
npx @tyyyho/treg init --framework react --dir ./packages/web
```

## Notes

- `init` auto-detects framework from repo dependencies.
- Detection order is `nuxt -> next -> react -> vue -> svelte -> node`.
- Default test runner is `vitest` for `vue`/`nuxt`, and `jest` for other frameworks.
- `add` lets you install only the features you specify.
- Framework setup uses one stable config per framework (no `--framework-version` variants).
- `--dry-run` prints the full plan and does not write files.
