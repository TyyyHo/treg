<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0F172A,30:1D4ED8,70:7C3AED,100:22C55E&height=260&section=header&text=Treg&fontSize=72&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Inject%20an%20immune%20system%20into%20your%20codebase&descSize=20&descAlignY=58" width="100%" />

# @tylercore/treg（简体中文）

[![npm version](https://img.shields.io/npm/v/%40tylercore%2Ftreg?style=flat-square)](https://www.npmjs.com/package/%40tylercore%2Ftreg)
[![License](https://img.shields.io/npm/l/%40tylercore%2Ftreg?style=flat-square)](https://www.npmjs.com/package/%40tylercore%2Ftreg)
[![npm downloads](https://img.shields.io/npm/dm/%40tylercore%2Ftreg?style=flat-square)](https://www.npmjs.com/package/%40tylercore%2Ftreg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)
![CLI](https://img.shields.io/badge/CLI-Interactive-111827?style=flat-square&logo=gnubash&logoColor=white)

[English](./README.md) | [繁體中文](./README.zh-hant.md) | [简体中文](./README.zh-hans.md) | [Español](./README.es.md) | [日本語](./README.ja.md)

</div>

---

## 概览

## 什么是 Treg？

Treg 是一个为现代应用建立代码质量、工具链与项目规范基准线的 CLI 工具。

它是一个为项目注入“免疫系统”的 CLI 工具。  
当开发者与 AI 高速协作时，代码库很容易出现规范不一致、规则重复、流程脆弱等问题。  
`Treg` 的角色就像调节型 T 细胞：协助恢复平衡、抑制可避免的混乱，让项目维持 **干净、可维护、可扩展**。

`Treg` 不生成产品业务逻辑，而是专注于建立可长期保持稳定的工程基准线。

> **先规范开发流程，才不会被流程反过来牵制。**

---

## 为什么需要 Treg

在 AI 辅助开发时代，项目速度可以很快。  
但速度若缺少约束，通常会留下看不见的技术债：

- 风格漂移
- 工具链不一致
- commit 卫生不足
- 测试覆盖缺漏
- AI 使用规则不清

`Treg` 通过一次初始化流程，把一致的工程基准线套用到既有 repository。

---

## Treg 会建立什么

`Treg` 可配置：

- **TypeScript**
- **Linting**（ESLint）
- **Formatting**（Prettier 或 Oxfmt）
- **Testing**（Jest 或 Vitest）
- **Git hooks**（Husky）
- **AI rules guidance**（支持的 AI 工具说明）

这能稳定项目质量，同时不强制你采用特定产品架构。

---

## 快速开始

依检测结果套用默认设置：

```bash
npx @tylercore/treg init
```

只预览变更：

```bash
npx @tylercore/treg init --dry-run
```

交互式自定义设置：

```bash
npx @tylercore/treg setup
```

为既有项目加入单一功能或套件 preset：

```bash
npx @tylercore/treg add typescript
npx @tylercore/treg add zustand
```

---

## 指令

| Command | 说明                                                  |
| ------- | ----------------------------------------------------- |
| `init`  | 自动检测项目并套用默认工程基准线                      |
| `setup` | 以交互流程自定义工程基准线                            |
| `add`   | 加入单一功能或套件 preset，并同步 AI rules            |
| `list`  | 列出支持的 framework、feature、formatter、test runner |

---

## init 流程

执行 `init` 时，`Treg` 会自动检测 package manager 与 framework（顺序为 `nuxt -> next -> react -> vue -> svelte -> node`），并套用默认 features：lint、format、TypeScript、test、husky、AI rules guidance。

唯一的提问是是否安装检测到的 framework 默认 Packages。选择 `Yes` 会安装默认套件组合并写入套件相关 AI rules；选择 `No` 则跳过套件安装。

---

## setup 交互流程

执行 `setup` 时，`Treg` 会依序询问：

1. **Package manager**  
   `pnpm | npm | yarn | bun`

2. **Features**（可多选，默认全选）
   - lint
   - format
   - TypeScript
   - test
   - husky
   - AI rules guidance

3. **Test runner**（仅在选到 `test` 时询问）
   - `jest`
   - `vitest`
   - `skip`

4. **Formatter**（仅在选到 `format` 时询问）
   - `prettier`
   - `oxfmt`

5. **AI tools**（仅在选到 AI rules guidance 时询问）
   - Claude
   - Codex
   - Gemini

6. **套件安装**
   - `Yes`
   - `No`

7. **Packages**（仅在选择安装套件时询问）
   - 所有 framework 共用选项，例如 Zod、date-fns
   - framework 专属选项，例如 Tailwind CSS、Zustand 或 Pinia、TanStack Query、TanStack Router，以及各 framework 对应的 i18n 套件
   - 可不选任何项目直接进入下一步

使用 pnpm 时，Treg 会检查既有 `node_modules` 是否链接到与当前 pnpm 版本不同的 store。若检测到 store 不一致，Treg 会停止并打印重建提示，不会自动删除文件。请手动执行 `rm -rf node_modules` 和 `pnpm install` 重建后，再重新执行 Treg。

---

## add 流程

`add` 一次只加入一个 target：

```bash
npx @tylercore/treg add typescript
npx @tylercore/treg add zustand
```

支持的 feature targets：`lint`、`format`、`typescript`、`test`、`husky`。

套件 target 会使用目前检测到的 framework preset。例如 React 或 Next.js 项目执行 `add zustand` 时，会安装对应的 Zustand preset。与直接使用 package manager 不同，`add` 也会同步相关 AI rules guidance。

---

## 常见用法

初始化项目：

```bash
npx @tylercore/treg init
```

只预览 init 计划：

```bash
npx @tylercore/treg init --dry-run
```

交互式自定义设置：

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

加入 Zustand 并同步 AI rules：

```bash
npx @tylercore/treg add zustand
```

---

## CLI 参数

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

## 默认行为

### Framework 检测

检测顺序：

```text
nuxt -> next -> react -> vue -> svelte -> node
```

### Test Runner

- `vue` / `nuxt`：`vitest`
- 其他：`jest`

### Formatter

- `prettier`

---

## AI Rules 行为

`Treg` 会检查 repository root 的 AI 说明文件：

| Tool   | File        |
| ------ | ----------- |
| Claude | `CLAUDE.md` |
| Codex  | `AGENTS.md` |
| Gemini | `GEMINI.md` |

行为规则：

- 如果 `CLAUDE.md` 或 `GEMINI.md` 包含 `@AGENTS.md`，只会把 Treg guidance 写入 `AGENTS.md`
- 如果三种 AI 说明文件中已有任一文件存在，且没有文件委派到 `@AGENTS.md`，只更新已存在的文件
- 如果三种文件都不存在，会创建三个文件，把 guidance 写入 `AGENTS.md`，并在 `CLAUDE.md`、`GEMINI.md` 写入 `@AGENTS.md`
- 提示内容会直接写入目标 AI 说明文件

---

## 核心理念

`Treg` 的设计刻意保持单一职责。

它 **不** 是完整项目生成器。  
它 **不** 取代团队判断。  
它 **不** 强制产品架构。

它的目标是建立工程免疫层，避免快速迭代持续侵蚀代码质量。

---

<div align="center">
  <sub>Built to regulate chaotic iteration and protect long-term codebase health.</sub>
  <br />
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:22C55E,40:06B6D4,75:3B82F6,100:7C3AED&height=120&section=footer" width="100%" />
</div>
