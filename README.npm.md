# @tyyyho/treg

`treg` is a CLI for applying tooling standards in existing repositories.

It sets up infrastructure only:

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

- `init`
- `add`
- `list`

## Common Examples

Initialize with auto-detection:

```bash
npx @tyyyho/treg init
```

Initialize with explicit framework:

```bash
npx @tyyyho/treg init --framework react
```

Apply selected features:

```bash
npx @tyyyho/treg add --features lint,format
```

Use `oxfmt`:

```bash
npx @tyyyho/treg add --features format --formatter oxfmt
```

Skip format and test setup:

```bash
npx @tyyyho/treg add --no-format --no-test-runner
```

Preview only:

```bash
npx @tyyyho/treg init --dry-run
```

## Key Options

```text
--framework <node|react|next|vue|svelte|nuxt>
--features <lint,format,typescript,test,husky>
--no-format
--no-test-runner
--formatter <prettier|oxfmt>
--test-runner <jest|vitest>
--pm <pnpm|npm|yarn|auto>
--dir <path>
--force
--dry-run
--skip-husky-install
--skills
--no-skills
--help
```
