<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0F172A,30:1D4ED8,70:7C3AED,100:22C55E&height=260&section=header&text=Treg&fontSize=72&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Inject%20an%20immune%20system%20into%20your%20codebase&descSize=20&descAlignY=58" width="100%" />

# @tylercore/treg（中文）

[![npm version](https://img.shields.io/npm/v/%40tylercore%2Ftreg?style=flat-square)](https://www.npmjs.com/package/%40tylercore%2Ftreg)
[![License](https://img.shields.io/npm/l/%40tylercore%2Ftreg?style=flat-square)](https://www.npmjs.com/package/%40tylercore%2Ftreg)
[![npm downloads](https://img.shields.io/npm/dm/%40tylercore%2Ftreg?style=flat-square)](https://www.npmjs.com/package/%40tylercore%2Ftreg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)
![CLI](https://img.shields.io/badge/CLI-Interactive-111827?style=flat-square&logo=gnubash&logoColor=white)

[English](./README.md) | [繁體中文](./README.zh-hant.md) | [简体中文](./README.zh-hans.md) | [Español](./README.es.md) | [日本語](./README.ja.md)

</div>

---

## 概覽

## 什麼是 Treg？

Treg 是一個為現代應用建立程式碼品質、工具鏈與專案規範基準線的 CLI 工具。

它是一個為專案注入「免疫系統」的 CLI 工具。  
當開發者與 AI 高速協作時，程式碼庫很容易出現規範不一致、規則重複、流程脆弱等問題。  
`Treg` 的角色就像調節型 T 細胞：協助恢復平衡、抑制可避免的混亂，讓專案維持 **乾淨、可維護、可擴展**。

`Treg` 不產生產品商業邏輯，而是專注於建立可長期保持穩定的工程基準線。

> **先規範開發流程，才不會被流程反過來牽制。**

---

## 為什麼需要 Treg

在 AI 輔助開發時代，專案速度可以很快。  
但速度若缺少約束，通常會留下看不見的技術債：

- 風格漂移
- 工具鏈不一致
- commit 衛生不足
- 測試覆蓋缺漏
- AI 使用規則不清

`Treg` 透過一次初始化流程，把一致的工程基準線套用到既有 repository。

---

## Treg 會建立什麼

`Treg` 可配置：

- **TypeScript**
- **Linting**（ESLint）
- **Formatting**（Prettier 或 Oxfmt）
- **Testing**（Jest 或 Vitest）
- **Git hooks**（Husky）
- **AI rules guidance**（支援的 AI 工具說明）

這能穩定專案品質，同時不強制你採用特定產品架構。

---

## 快速開始

依偵測結果套用預設設定：

```bash
npx @tylercore/treg init
```

只預覽變更：

```bash
npx @tylercore/treg init --dry-run
```

互動式自訂設定：

```bash
npx @tylercore/treg setup
```

為既有專案加入單一功能或套件 preset：

```bash
npx @tylercore/treg add typescript
npx @tylercore/treg add zustand
```

---

## 指令

| Command | 說明                                                  |
| ------- | ----------------------------------------------------- |
| `init`  | 自動偵測專案並套用預設工程基準線                      |
| `setup` | 以互動流程自訂工程基準線                              |
| `add`   | 加入單一功能或套件 preset，並同步 AI rules            |
| `list`  | 列出支援的 framework、feature、formatter、test runner |

---

## init 流程

執行 `init` 時，`Treg` 會自動偵測：

- package manager
- framework，偵測順序為 `nuxt -> next -> react -> vue -> svelte -> node`

接著會套用預設 features：

- lint
- format
- TypeScript
- test
- husky
- AI rules guidance

唯一的提問是是否安裝偵測到的 framework 預設 Packages。選 `Yes` 會安裝預設套件組合並寫入套件相關 AI rules；選 `No` 則略過套件安裝。

---

## setup 互動流程

執行 `setup` 時，`Treg` 會依序詢問：

1. **Package manager**  
   `pnpm | npm | yarn | bun`

2. **Features**（可複選，預設全選）
   - lint
   - format
   - TypeScript
   - test
   - husky
   - AI rules guidance

3. **Test runner**（僅在選到 `test` 時詢問）
   - `jest`
   - `vitest`
   - `skip`

4. **Formatter**（僅在選到 `format` 時詢問）
   - `prettier`
   - `oxfmt`

5. **AI tools**（僅在選到 AI rules guidance 時詢問）
   - Claude
   - Codex
   - Gemini

6. **套件安裝**
   - `Yes`
   - `No`

7. **Packages**（僅在選擇安裝套件時詢問）
   - 所有 framework 共用選項，例如 Zod、date-fns
   - framework 專屬選項，例如 Tailwind CSS、Zustand 或 Pinia、TanStack Query、TanStack Router，以及各 framework 對應的 i18n 套件
   - 可不選任何項目直接進入下一步

Node.js 會視為後端目標，因此套件清單會偏向 server、設定、logging 與 database tooling。

選到的套件會依用途安裝到 dependencies 或 devDependencies。若啟用 AI rules guidance，也會把所選套件各自的提示詞寫入所選 AI rules 檔案。

使用 pnpm 時，Treg 會檢查既有 `node_modules` 是否連到與目前 pnpm 版本不同的 store。若偵測到 store 不一致，Treg 會停止並印出重建提示，不會自動刪除檔案。請手動執行 `rm -rf node_modules` 與 `pnpm install` 重建後，再重新執行 Treg。

---

## add 流程

`add` 一次只加入一個 target：

```bash
npx @tylercore/treg add typescript
npx @tylercore/treg add zustand
```

支援的 feature targets：

- `lint`
- `format`
- `typescript`
- `test`
- `husky`

套件 target 會使用目前偵測到的 framework preset。例如 React 或 Next.js 專案執行 `add zustand` 時，會安裝對應的 Zustand preset。與直接使用 package manager 不同，`add` 也會同步相關 AI rules guidance。

---

## 常見用法

初始化專案：

```bash
npx @tylercore/treg init
```

只預覽 init 計畫：

```bash
npx @tylercore/treg init --dry-run
```

互動式自訂設定：

```bash
npx @tylercore/treg setup
```

format 使用 `oxfmt`：

```bash
npx @tylercore/treg add format --formatter oxfmt
```

test 使用 `vitest`：

```bash
npx @tylercore/treg add test --test-runner vitest
```

加入 Zustand 並同步 AI rules：

```bash
npx @tylercore/treg add zustand
```

---

## CLI 參數

### `init`

```text
--dry-run
--help
```

### `setup`

```text
--dry-run
--help
```

### `add`

```text
add <lint|format|typescript|test|husky|package-preset>
--framework <node|react|next|vue|svelte|nuxt>
--dir <path>
--formatter <prettier|oxfmt>
--test-runner <jest|vitest>
--force
--dry-run
--skip-husky-install
--help
```

---

## 預設行為

### Framework 偵測

偵測順序：

```text
nuxt -> next -> react -> vue -> svelte -> node
```

### Test Runner

- `vue` / `nuxt`：`vitest`
- 其他：`jest`

### Formatter

- `prettier`

---

## AI Rules 行為

`Treg` 會檢查 repository root 的 AI 說明文件：

| Tool   | File        |
| ------ | ----------- |
| Claude | `CLAUDE.md` |
| Codex  | `AGENTS.md` |
| Gemini | `GEMINI.md` |

行為規則：

- 如果 `CLAUDE.md` 或 `GEMINI.md` 包含 `@AGENTS.md`，只會把 Treg guidance 寫入 `AGENTS.md`
- 如果三種 AI 說明文件中已有任一檔案存在，且沒有檔案委派到 `@AGENTS.md`，只更新已存在的檔案
- 如果三種檔案都不存在，會建立三個檔案，把 guidance 寫入 `AGENTS.md`，並在 `CLAUDE.md`、`GEMINI.md` 寫入 `@AGENTS.md`
- 提示內容會直接寫入目標 AI 說明文件

---

## 核心理念

`Treg` 的設計刻意保持單一職責。

它 **不** 是完整專案產生器。  
它 **不** 取代團隊判斷。  
它 **不** 強制產品架構。

它的目標是建立工程免疫層，避免快速迭代持續侵蝕程式碼品質。

---

<div align="center">
  <sub>Built to regulate chaotic iteration and protect long-term codebase health.</sub>
  <br />
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:22C55E,40:06B6D4,75:3B82F6,100:7C3AED&height=120&section=footer" width="100%" />
</div>
