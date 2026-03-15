# @tyyyho/treg（繁體中文）

[English README](./README.md)

`treg` 是一個用於既有專案的 CLI，可快速套用一致的工具鏈規範。

它只處理基礎設施設定：

- lint
- format
- TypeScript
- test
- husky
- AI skill 指引

## 為什麼用 treg

`treg` 可以在既有 repo 中快速建立一致的開發基線，避免每次手動重接工具。

適合用在：

- 快速補齊專案工具鏈
- 只套用部分 feature
- 需要可重跑且不破壞設定（`idempotent`）
- 先看完整計畫再寫檔（`--dry-run`）

## 快速開始

```bash
npx @tyyyho/treg init
```

```bash
pnpm dlx @tyyyho/treg init
```

## 指令總覽

- `init`：依賴自動偵測 framework 並套用基礎規範。
- `add`：只套用指定 features。
- `list`：列出支援的 framework、feature、formatter、test runner。

## 常見用法

自動偵測 framework 初始化：

```bash
npx @tyyyho/treg init
```

手動指定 framework：

```bash
npx @tyyyho/treg init --framework react
```

只套用 lint + format：

```bash
npx @tyyyho/treg add --features lint,format
```

format 改用 `oxfmt`：

```bash
npx @tyyyho/treg add --features format --formatter oxfmt
```

保留既有設定，跳過 format/test：

```bash
npx @tyyyho/treg add --no-format --no-test-runner
```

只預覽計畫不寫檔：

```bash
npx @tyyyho/treg init --framework react --dry-run
```

指定目標目錄：

```bash
npx @tyyyho/treg init --framework react --dir ./packages/web
```

## 重要預設

framework 偵測順序：

`nuxt -> next -> react -> vue -> svelte -> node`

測試工具預設：

- `vue` / `nuxt`：`vitest`
- 其他：`jest`

formatter 預設：

- `prettier`（可用 `--formatter oxfmt` 覆寫）

## CLI 參數

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

## AI Skills 行為

啟用 skills 時：

- 若 repo root 已存在 `CLAUDE.md`、`AGENTS.md`、`GEMINI.md`，會更新對應內容。
- 若檔案不存在，不會自動建立。

## 發布

```bash
pnpm release patch
```

支援目標：

- `patch`
- `minor`
- `major`
- `prepatch`
- `preminor`
- `premajor`
- `prerelease`
- 指定版本（`x.y.z`）
