# AGENTS.md

## Project scope

- 這個專案是 `treg` CLI，定位為「基礎建設工具」。
- 僅處理工具鏈與專案規範（lint、format、typescript、test、husky、ai-skills）。
- 禁止加入產品功能、頁面、API、商業邏輯。
- 完成功能後Claude會進行code review
- README跟README.zh-hant要同步修改

## Architecture rules

- CLI orchestration 與 feature execution 必須分離。
- 底層執行統一使用 `mrm-core` rule 方式實作。
- 每個 feature 必須可獨立執行，且具備 idempotent 行為（重跑不破壞）。

## Framework layout (required)

- 每個框架的規則必須放在獨立資料夾，禁止混寫。
- 建議結構：
  - `scripts/init-project/frameworks/node/*`
  - `scripts/init-project/frameworks/react/*`
  - `scripts/init-project/frameworks/next/*`
  - `scripts/init-project/frameworks/vue/*`
  - `scripts/init-project/frameworks/svelte/*`
- 每個框架僅維持單一版本設定，不再支援版本子目錄變體。

## Git & commit rules

- 一律從 `main` 切分支，分支名稱格式採用：`<類別>/<主題>`，範例：`feat/<topic>` 或 `fix/<topic>`。
- 永遠禁止 --no-verify。
- merge時，使用--no-ff。
- 禁止直接改 `main`，一律透過 PR。
- 每個任務至少一個 commit；大型任務請拆成多個可審查 commit。
- commit 訊息格式：`<type>: <summary>`。
- commit 前必看：`git diff --staged`，確保無混入無關變更。

## Validation rules (required before commit)

- 必跑：
  - `pnpm format`
  - `pnpm lint:check`
  - `pnpm type:check`
  - `pnpm test`
- 任一失敗必須先修復再 commit。

## CI/CD workflow rules

- GitHub Actions workflow 分成：
  - `.github/workflows/ci.yml`
  - `.github/workflows/publish.yml`
  - `.github/workflows/_verify.yml`
- `ci.yml` 僅監聽 `main` branch 的 push。
- `publish.yml` 僅監聽版本 tag（`v*`）的 push。
- 安裝與共用驗證步驟（format/lint/type:check/test/build/smoke test）統一放在 reusable workflow `_verify.yml`。

## CLI behavior rules

- `init` 需預設依賴偵測框架（順序：`nuxt -> next -> react -> vue -> svelte -> node`），`--framework` 僅作為覆寫選項。
- 不支援 `--framework-version`，每個 framework 只使用單一版本規則。
- `add` 必須允許只安裝指定 features。
- `format` feature 必須支援 `--formatter <prettier|oxfmt>`，預設為 `prettier`。
- 需支援 `--no-format` 與 `--no-test-runner` 以跳過 format/test 安裝，避免覆寫既有設定。
- 預設測試工具規則：`vue`/`nuxt` 使用 `vitest`，其餘 framework 使用 `jest`。
- `test` feature 必須支援 `--test-runner <jest|vitest>`。
- `--dry-run` 必須輸出完整計畫且不寫入檔案。

## AI skills rules

- 每個 feature 對應一個 skill。
- 若啟用 skills，僅在 repo root 已存在 `CLAUDE.md`、`AGENTS.md` 或 `GEMINI.md` 時更新內容。
- 若檔案不存在，只輸出 skip 訊息，不自動建立。
