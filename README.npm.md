# @tyyyho/treg

Treg (Regulatory T Cell) injects an "immune system" into existing repositories.
It keeps code quality and consistency stable during fast human-AI collaboration by enforcing a clean, maintainable, and extensible engineering baseline.

Scope:

- lint
- format
- TypeScript
- test
- husky
- AI skill guidance

Quick start:

```bash
npx @tyyyho/treg init
```

Commands:

- `init`
- `add`
- `list`

`init` interactive questions:

1. package manager (`pnpm|npm|yarn|bun`)
2. features (default: `all`)
3. test runner (if `test` is selected, supports `skip`)
4. formatter (if `format` is selected)
5. ai tools (`Claude|Codex|Gemini`, multi-select, if AI skill guidance is selected)

`add` examples:

```bash
npx @tyyyho/treg add --features lint,format
npx @tyyyho/treg add --features format --formatter oxfmt
npx @tyyyho/treg add --features test --test-runner vitest
```

Options:

`init`:

```text
--dry-run
--help
```

`add`:

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

Defaults:

- framework detect order: `nuxt -> next -> react -> vue -> svelte -> node`
- test runner: `vue/nuxt = vitest`, others = `jest`
- formatter: `prettier`
