# @tyyyho/treg（繁體中文）

[English README](./README.md)

`treg` 是一個用於既有專案的 CLI 工具，可快速建立與套用工具鏈規範。
預設搭建基礎設定，包含 lint、format、TypeScript、test、husky、skills。

## 快速開始

```bash
npx @tyyyho/treg init
```

```bash
pnpm dlx @tyyyho/treg init
```

`init` 會依照依賴自動偵測 framework。

## 指令

```bash
npx @tyyyho/treg <command> [options]
```

- `init`：初始化基礎規範（依賴自動偵測 framework）
- `add`：在既有專案中新增指定 feature
- `list`：列出支援的 framework、feature、formatter 與 test runner

## 參數

- `--framework <node|react|next|vue|svelte|nuxt>`：可選，手動覆寫 framework
- `--features <lint,format,typescript,test,husky>`：指定要安裝的 feature（預設全部）
- `--no-format`：略過 format feature，避免覆寫既有格式化設定與 scripts
- `--no-test-runner`：略過 test feature，避免覆寫既有測試 runner 與設定
- `--dir <path>`：指定目標目錄（預設為目前目錄）
- `--formatter <prettier|oxfmt>`：format feature 使用的 formatter（預設為 `prettier`）
- `--test-runner <jest|vitest>`：可選，啟用 test feature 時覆寫測試框架
- `--pm <pnpm|npm|yarn|auto>`：套件管理器（預設自動偵測）
- `--force`：覆寫既有設定檔
- `--dry-run`：輸出完整執行計畫，但不寫入檔案
- `--skip-husky-install`：略過 `husky install`
- `--skills`：更新既有 `CLAUDE.md`/`AGENTS.md`/`GEMINI.md` 的 skill 指引（預設啟用）
- `--no-skills`：停用 skill 指引更新
- `--help`：顯示說明

## Features

預設 feature 組合：

- `husky`
- `typescript`
- `lint`
- `format`
- `test`

## 使用範例

依賴自動偵測 framework 初始化：

```bash
npx @tyyyho/treg init
```

手動指定 framework 初始化：

```bash
npx @tyyyho/treg init --framework react
```

只安裝 lint + format：

```bash
npx @tyyyho/treg add --features lint,format
```

改用 oxfmt（不使用 prettier）：

```bash
npx @tyyyho/treg add --features format --formatter oxfmt
```

若要保留既有設定，可跳過 format/test 安裝：

```bash
npx @tyyyho/treg add --no-format --no-test-runner
```

test feature 使用 Vitest：

```bash
npx @tyyyho/treg init --framework node --features test --test-runner vitest
```

僅預覽變更（不寫檔）：

```bash
npx @tyyyho/treg init --framework react --dry-run
```

更新 AI skills 指引：

```bash
npx @tyyyho/treg add --features lint,format,husky
```

明確指定其他目錄：

```bash
npx @tyyyho/treg init --framework react --dir ./packages/web
```

## 注意事項

- `init` 會依 repo 依賴自動偵測 framework。
- 偵測順序：`nuxt -> next -> react -> vue -> svelte -> node`。
- 預設測試工具為：`vue`/`nuxt` 使用 `vitest`，其他 framework 使用 `jest`。
- 預設 formatter 為 `prettier`（可用 `--formatter oxfmt` 覆寫）。
- 可透過 `--no-format` 與 `--no-test-runner` 跳過對 format/test 的設定，避免覆寫既有專案規則。
- `add` 可只安裝你指定的 features。
- 每個 framework 僅提供單一穩定設定，不支援 `--framework-version` 版本變體。
- `--dry-run` 會輸出完整計畫且不寫入任何檔案。
