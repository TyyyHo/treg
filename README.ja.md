<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0F172A,30:1D4ED8,70:7C3AED,100:22C55E&height=260&section=header&text=Treg&fontSize=72&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Inject%20an%20immune%20system%20into%20your%20codebase&descSize=20&descAlignY=58" width="100%" />

# @tylercore/treg（日本語）

[![npm version](https://img.shields.io/npm/v/%40tylercore%2Ftreg?style=flat-square)](https://www.npmjs.com/package/%40tylercore%2Ftreg)
[![License](https://img.shields.io/npm/l/%40tylercore%2Ftreg?style=flat-square)](https://www.npmjs.com/package/%40tylercore%2Ftreg)
[![npm downloads](https://img.shields.io/npm/dm/%40tylercore%2Ftreg?style=flat-square)](https://www.npmjs.com/package/%40tylercore%2Ftreg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)
![CLI](https://img.shields.io/badge/CLI-Interactive-111827?style=flat-square&logo=gnubash&logoColor=white)

[English](./README.md) | [繁體中文](./README.zh-hant.md) | [简体中文](./README.zh-hans.md) | [Español](./README.es.md) | [日本語](./README.ja.md)

</div>

---

## 概要

## Treg とは？

Treg は、モダンなアプリケーション向けにコード品質、ツールチェーン、プロジェクト規約を整備する CLI ツールです。

プロジェクトに **エンジニアリングの免疫システム** を注入します。

開発者と AI が高速に反復開発を行うと、コードベースは徐々に乱れ、ツール設定の不一致、ルールの重複、壊れやすいワークフローが生まれがちです。  
Treg は制御性 T 細胞のように、バランスを取り戻し、不要な混乱を抑え、リポジトリを **クリーンで保守しやすく拡張可能** な状態に保ちます。

アプリケーション機能を生成するのではなく、Treg はエンジニアリング基盤に集中します。ESLint、Prettier、TypeScript などを設定し、長期的な劣化からプロジェクトを守ります。

> **ワークフローに支配される前に、ワークフローを整える。**

---

## なぜ Treg か

AI 支援開発では、プロジェクトを非常に速く進められます。  
しかし制約のないスピードは、見えにくいダメージを生みやすくなります。

- スタイルのドリフト
- ツールチェーンの不整合
- コミット品質の低下
- テスト不足
- AI 利用ルールの不明確さ

`Treg` は、単一の初期化フローで既存リポジトリに一貫した基盤を適用し、これらを解消します。

---

## Treg が設定するもの

`Treg` は次を設定できます。

- **TypeScript**
- ESLint による **Linting**
- Prettier / Oxfmt による **Formatting**
- Jest / Vitest による **Testing**
- Husky による **Git hooks**
- 対応ツール向け **AI rules guidance**

これにより、プロダクト設計を強制せずにプロジェクトを安定させられます。

---

## クイックスタート

検出された既定値で初期化:

```bash
npx @tylercore/treg init
```

変更内容のみを確認:

```bash
npx @tylercore/treg init --dry-run
```

対話形式で設定をカスタマイズ:

```bash
npx @tylercore/treg setup
```

既存プロジェクトに feature または package preset を 1 つ追加:

```bash
npx @tylercore/treg add typescript
npx @tylercore/treg add zustand
```

---

## コマンド

| コマンド | 説明                                                        |
| -------- | ----------------------------------------------------------- |
| `init`   | プロジェクトを自動検出し既定の基盤設定を適用                |
| `setup`  | 対話式フローで基盤設定をカスタマイズ                        |
| `add`    | feature または package preset を 1 つ追加し AI rules を同期 |
| `list`   | 対応 framework、feature、formatter、test runner を表示      |

---

## `init` のフロー

`init` 実行時、`Treg` は package manager と framework（検出順: `nuxt -> next -> react -> vue -> svelte -> node`）を自動検出し、既定の features（lint、format、TypeScript、test、husky、AI rules guidance）を適用します。

唯一の質問は、検出した framework の既定 Packages をインストールするかどうかです。`Yes` を選ぶと既定パッケージセットをインストールし、関連する AI rules guidance も書き込みます。`No` を選ぶとパッケージのインストールをスキップします。

---

## `setup` の対話フロー

`setup` 実行時、`Treg` は以下を順に確認します。

1. **Package manager**  
   `pnpm | npm | yarn | bun`

2. **Features**（複数選択、初期値は全選択）
   - lint
   - format
   - TypeScript
   - test
   - husky
   - AI rules guidance

3. **Test runner**（`test` を選んだ場合のみ）
   - `jest`
   - `vitest`
   - `skip`

4. **Formatter**（`format` を選んだ場合のみ）
   - `prettier`
   - `oxfmt`

5. **AI tools**（AI rules guidance を選んだ場合のみ）
   - Claude
   - Codex
   - Gemini

6. **Package installation**
   - `Yes`
   - `No`

7. **Packages**（パッケージインストールを選んだ場合のみ）
   - Zod や date-fns など、全 framework 共通の選択肢
   - Tailwind CSS、Zustand / Pinia、TanStack Query、TanStack Router、framework 別 i18n などの選択肢
   - 何も選ばずに次へ進めます

pnpm を使う場合、Treg は既存の `node_modules` が現在の pnpm が使う store と異なる store にリンクされていないかを確認します。store の不一致を検出した場合、Treg はファイルを自動削除せず、停止して再構築手順を表示します。`rm -rf node_modules` と `pnpm install` を手動で実行してから、Treg を再実行してください。

---

## `add` のフロー

`add` は 1 回の実行で 1 つの target だけを追加します。

```bash
npx @tylercore/treg add typescript
npx @tylercore/treg add zustand
```

対応 feature targets: `lint`、`format`、`typescript`、`test`、`husky`。

package target は検出された framework の preset 一覧を使います。たとえば React / Next.js プロジェクトで `add zustand` を実行すると、対応する Zustand preset をインストールします。package manager を直接使う場合と異なり、`add` は関連する AI rules guidance も同期します。

---

## よく使う例

プロジェクトを初期化:

```bash
npx @tylercore/treg init
```

`init` 計画のみ表示:

```bash
npx @tylercore/treg init --dry-run
```

対話形式で設定をカスタマイズ:

```bash
npx @tylercore/treg setup
```

`oxfmt` で format を追加:

```bash
npx @tylercore/treg add format --formatter oxfmt
```

`vitest` で test を追加:

```bash
npx @tylercore/treg add test --test-runner vitest
```

Zustand を追加して AI rules を同期:

```bash
npx @tylercore/treg add zustand
```

---

## CLI オプション

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

## デフォルト

### Framework 検出

検出順序:

```text
nuxt -> next -> react -> vue -> svelte -> node
```

### Test Runner

- `vue` / `nuxt`: `vitest`
- その他: `jest`

### Formatter

- `prettier`

---

## AI Rules の挙動

`Treg` は、リポジトリルートの AI ガイダンスファイルを確認します。

| Tool   | File        |
| ------ | ----------- |
| Claude | `CLAUDE.md` |
| Codex  | `AGENTS.md` |
| Gemini | `GEMINI.md` |

挙動:

- `CLAUDE.md` または `GEMINI.md` に `@AGENTS.md` が含まれる場合、Treg guidance は `AGENTS.md` のみに書き込み
- 3 種類の AI ガイダンスファイルのいずれかが存在し、どれも `@AGENTS.md` に委譲していない場合、既存ファイルのみ更新
- 3 種類のファイルがすべて存在しない場合、3 ファイルを作成し、guidance を `AGENTS.md` に書き込み、`CLAUDE.md` と `GEMINI.md` には `@AGENTS.md` を書き込み
- プロンプトは対象の AI ガイダンス文書へ直接書き込み

---

## 思想

`Treg` は意図的にスコープを絞っています。

完全なプロジェクトジェネレーターには **しません**。  
チームの判断を **置き換えません**。  
プロダクトアーキテクチャを **強制しません**。

目的は、反復速度が上がってもコードベースの品質が崩れないよう、エンジニアリングの免疫レイヤーを整えることです。

---

<div align="center">
  <sub>混沌とした反復開発を整え、長期的なコードベース健全性を守るために。</sub>
  <br />
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:22C55E,40:06B6D4,75:3B82F6,100:7C3AED&height=120&section=footer" width="100%" />
</div>
