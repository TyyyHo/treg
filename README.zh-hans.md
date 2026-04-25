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

交互式初始化：

```bash
npx @tylercore/treg init
```

只预览变更：

```bash
npx @tylercore/treg init --dry-run
```

为既有项目补上指定功能：

```bash
npx @tylercore/treg add
```

---

## 指令

| Command | 说明                                                  |
| ------- | ----------------------------------------------------- |
| `init`  | 以交互流程初始化项目基准线                            |
| `add`   | 为既有项目加入指定功能                                |
| `list`  | 列出支持的 framework、feature、formatter、test runner |

---

## init 交互流程

执行 `init` 时，`Treg` 会依序询问：

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

---

## add 交互流程

执行 `add` 时，`Treg` 会依序询问：

1. **Features**（可多选）
   - lint
   - format
   - TypeScript
   - test
   - husky
   - AI rules guidance（仅在 AI rules 文件已存在时显示）

2. **Formatter**（仅在选到 `format` 时询问）
   - `prettier`
   - `oxfmt`

3. **Test runner**（仅在选到 `test` 时询问）
   - `jest`
   - `vitest`
   - `skip`

4. **AI tools**（仅在选到 AI rules guidance 时询问）
   - Claude
   - Codex
   - Gemini

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

只加入 lint + format：

```bash
npx @tylercore/treg add
```

接着选择 `lint` 与 `format`。

format 使用 `oxfmt`：

```bash
npx @tylercore/treg add
```

接着选择 `format`，再选择 `oxfmt`。

test 使用 `vitest`：

```bash
npx @tylercore/treg add
```

接着选择 `test`，再选择 `vitest`。

---

## CLI 参数

### `init`

```text
--dry-run
--help
```

### `add`

交互模式：

```text
add
```

自动化可选参数：

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

`Treg` 可更新所选 AI 工具的说明文件：

| Tool   | File        |
| ------ | ----------- |
| Claude | `CLAUDE.md` |
| Codex  | `AGENTS.md` |
| Gemini | `GEMINI.md` |

行为规则：

- 只更新你选择的工具
- 缺少的对应文件会自动创建
- 更新发生在 repository root
- 提示内容会直接写入每个选定的 AI 说明文件

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
