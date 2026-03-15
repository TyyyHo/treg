# @tyyyho/treg

[繁體中文 README](./README.zh-hant.md)

`treg` is a CLI for applying project tooling standards to an existing repository.
It only handles infrastructure setup:

- lint
- format
- TypeScript
- test
- husky
- AI skill guidance

## Quick Start

```bash
npx @tyyyho/treg init
```

## Commands

- `init`: Initialize.
- `add`: Add selected features to an existing project.
- `list`: Show supported frameworks/features/formatters/test runners.

## Init Interactive Flow

After `init`, `treg` asks:

1. Package manager (`pnpm|npm|yarn|bun`)
2. Features (default selected: `all`)
3. Test runner (only when `test` is selected, supports `skip`)
4. Formatter (only when `format` is selected)
5. AI tools (`Claude|Codex|Gemini`, multi-select, only when AI skill guidance is selected)

Default `all` includes:

- lint
- format
- TypeScript
- test
- husky
- AI skill guidance

## Common Usage

Initialize with interactive prompts:

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
- Files are updated only if they already exist in repo root.
- Missing files are skipped and never auto-created.
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
