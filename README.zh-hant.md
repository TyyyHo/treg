# @tyyyho/treg（繁體中文）

[![npm version](https://img.shields.io/npm/v/%40tyyyho%2Ftreg)](https://www.npmjs.com/package/%40tyyyho%2Ftreg)
[![License](https://img.shields.io/npm/l/%40tyyyho%2Ftreg)](https://www.npmjs.com/package/%40tyyyho%2Ftreg)
[![npm downloads](https://img.shields.io/npm/dm/%40tyyyho%2Ftreg)](https://www.npmjs.com/package/%40tyyyho%2Ftreg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)

[English README](./README.md)

Treg（Regulatory T Cell）是一個為專案注入「免疫系統」的 CLI 工具。
當人與 AI 協作並快速迭代時，程式碼容易失去秩序與一致性；`treg` 的角色就像生物中的 T 細胞，負責維持系統平衡、抑制混亂，確保專案在快速迭代中仍然保持乾淨、可維護與可擴展。

透過一次性的初始化，`treg` 會為既有專案建立一套穩定的工程基線，例如 TypeScript、ESLint、Prettier、Husky 以及規範化設定，讓開發流程具備基本的「免疫防護」，避免錯誤與風格混亂在專案中持續累積。
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
2. 要加入的功能（可複選，預設全勾）
3. 測試工具（僅在選到 `test` 時詢問，支援 `skip`）
4. Formatter（僅在選到 `format` 時詢問）
5. AI 工具（`Claude|Codex|Gemini` 可複選，僅在選到 AI skill guidance 時詢問）

預設勾選功能：

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
- 若檔案已存在會直接更新。
- 選擇的 AI 工具對應檔案不存在時，會先自動建立再注入說明。
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
