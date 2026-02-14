# AGENTS.md

## Project scope

- 這個專案是 `frontend-rules` CLI，定位為「基礎建設工具」。
- 僅處理工具鏈與專案規範（lint、format、typescript、test、husky、ai-skills）。
- 禁止加入產品功能、頁面、API、商業邏輯。

## Architecture rules

- CLI orchestration 與 feature execution 必須分離。
- 底層執行統一使用 `mrm-core` rule 方式實作。
- 每個 feature 必須可獨立執行，且具備 idempotent 行為（重跑不破壞）。

## Framework layout (required)

- 每個框架的規則與變體必須放在獨立資料夾，禁止混寫。
- 建議結構：
  - `scripts/init-project/frameworks/node/*`
  - `scripts/init-project/frameworks/react/*`
  - `scripts/init-project/frameworks/next/*`
  - `scripts/init-project/frameworks/vue/*`
  - `scripts/init-project/frameworks/svelte/*`
- 若有大版本差異，放在框架資料夾下的版本子目錄（例如 `react/v18`, `react/v19`）。

## Git & commit rules

- 一律從 `main` 切分支：`feat/<topic>` 或 `fix/<topic>`。
- 禁止直接改 `main`，一律透過 PR。
- 每個任務至少一個 commit；大型任務請拆成多個可審查 commit。
- commit 訊息格式：`<type>: <summary>`。
- commit 前必看：`git diff --staged`，確保無混入無關變更。

## Validation rules (required before commit)

- 必跑：
  - `pnpm format`
  - `pnpm lint:check`
  - `pnpm type-check`
  - `pnpm test`
- 任一失敗必須先修復再 commit。

## CLI behavior rules

- `init` 必須要求 `--framework`。
- `add` 必須允許只安裝指定 features。
- `test` feature 必須支援 `--test-runner <jest|vitest>`。
- `--dry-run` 必須輸出完整計畫且不寫入檔案。

## AI skills rules

- 每個 feature 對應一個 skill。
- 若啟用 skills，僅在 repo root 已存在 `AGENTS.md` 或 `CLAUDE.md` 時更新內容。
- 若檔案不存在，只輸出 skip 訊息，不自動建立。
