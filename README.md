# frontend-rules

`frontend-rules` is a CLI that bootstraps project infra rules into an existing repository.

## Usage

```bash
pnpm dlx frontend-rules init <project-dir> --framework react
# or
npx frontend-rules init <project-dir> --framework react
```

By default, all features are applied:

- `husky`
- `typescript`
- `lint`
- `format`
- `test`

## Options

```bash
frontend-rules <command> [projectDir] [options]

init                                 Initialize infra rules (requires --framework)
add                                  Add selected infra features
list                                 List supported targets

--framework <node|react|next|vue|svelte|nuxt>
                                      Target framework
--framework-version <major>          Optional major version hint (currently react only)
--pm <pnpm|npm|yarn|auto>            Package manager (auto-detected by default)
--features <lint,format,typescript,test,husky>
                                      Features to install (all selected by default)
--test-runner <jest|vitest>          Test runner when test feature is enabled
--force                               Overwrite existing config files
--dry-run                             Show planned changes without writing files
--skip-husky-install                  Do not run husky install
--skills                              Update AGENTS.md/CLAUDE.md with feature skill guidance
--help                                Show help
```

## Examples

Initialize a React project:

```bash
frontend-rules init . --framework react
```

Add only lint and format:

```bash
frontend-rules add . --features lint,format
```

Use Vitest:

```bash
frontend-rules init . --framework node --features test --test-runner vitest
```

Set framework major version explicitly (for variant rules):

```bash
frontend-rules init . --framework react --framework-version 18
```

Preview changes only:

```bash
frontend-rules init . --framework react --dry-run
```

Enable AI skill guidance update:

```bash
frontend-rules add . --features lint,format,husky --skills
```

## Publish

```bash
pnpm install
pnpm run prepublishOnly
npm publish --access public
```
