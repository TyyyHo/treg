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

## 快速開始

```bash
npx @tyyyho/treg init
```

## 指令總覽

- `init`：初始化功能。
- `add`：只為既有專案加入指定功能。
- `list`：列出支援的 framework/feature/formatter/test runner。

## Init 互動流程

執行 `init` 後，`treg` 會依序詢問：

1. 套件管理器（`pnpm|npm|yarn|bun`）
2. 要加入的功能（預設勾選 `all`）
3. 測試工具（僅在選到 `test` 時詢問，支援 `skip`）
4. Formatter（僅在選到 `format` 時詢問）
5. AI 工具（`Claude|Codex|Gemini` 可複選，僅在選到 AI skill guidance 時詢問）

預設 `all` 內容：

- lint
- format
- TypeScript
- test
- husky
- AI skill guidance

## 常見用法

初始化：

```bash
npx @tyyyho/treg init
```

只預覽 init 計畫：

```bash
npx @tyyyho/treg init --dry-run
```

只加入 lint + format：

```bash
npx @tyyyho/treg add --features lint,format
```

format 使用 `oxfmt`：

```bash
npx @tyyyho/treg add --features format --formatter oxfmt
```

test 使用 `vitest`：

```bash
npx @tyyyho/treg add --features test --test-runner vitest
```

## CLI 參數

`init` 可用參數：

```text
--dry-run
--help
```

`add` 可用參數：

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

## 預設行為

framework 偵測順序：

`nuxt -> next -> react -> vue -> svelte -> node`

測試工具預設：

- `vue` / `nuxt`：`vitest`
- 其他：`jest`

formatter 預設：

- `prettier`

## AI Skills 行為

- 只會更新選擇的 AI 工具對應檔案：
  - `Claude -> CLAUDE.md`
  - `Codex -> AGENTS.md`
  - `Gemini -> GEMINI.md`
- 僅更新 repo root 已存在的檔案。
- 不存在的檔案會跳過，不會自動建立。
- 每個啟用功能的 skill 檔只會建立一次。

## 發布

```bash
npm run release -- patch
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
