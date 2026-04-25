<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0F172A,30:1D4ED8,70:7C3AED,100:22C55E&height=260&section=header&text=Treg&fontSize=72&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Inject%20an%20immune%20system%20into%20your%20codebase&descSize=20&descAlignY=58" width="100%" />

# @tylercore/treg（日本語）

[![npm version](https://img.shields.io/npm/v/%40tylercore%2Ftreg?style=flat-square)](https://www.npmjs.com/package/%40tylercore%2Ftreg)
[![License](https://img.shields.io/npm/l/%40tylercore%2Ftreg?style=flat-square)](https://www.npmjs.com/package/%40tylercore%2Ftreg)
[![npm downloads](https://img.shields.io/npm/dm/%40tylercore%2Ftreg?style=flat-square)](https://www.npmjs.com/package/%40tylercore%2Ftreg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)
![CLI](https://img.shields.io/badge/CLI-Interactive-111827?style=flat-square&logo=gnubash&logoColor=white)

[English](./README.md) | [繁體中文](./README.zh-hant.md) | [Español](./README.es.md) | [日本語](./README.ja.md)

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

対話形式で初期化:

```bash
npx @tylercore/treg init
```

変更内容のみを確認:

```bash
npx @tylercore/treg init --dry-run
```

既存プロジェクトに feature を追加:

```bash
npx @tylercore/treg add
```

---

## コマンド

| コマンド | 説明                                                   |
| -------- | ------------------------------------------------------ |
| `init`   | 対話式セットアップでプロジェクトを初期化               |
| `add`    | 既存プロジェクトへ選択した feature を追加              |
| `list`   | 対応 framework、feature、formatter、test runner を表示 |

---

## `init` の対話フロー

`init` 実行時、`Treg` は以下を順に確認します。

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

---

## `add` の対話フロー

`add` 実行時、`Treg` は以下を順に確認します。

1. **Features**（複数選択）
   - lint
   - format
   - TypeScript
   - test
   - husky
   - AI rules guidance（AI rules ファイルが既に存在する場合のみ）

2. **Formatter**（`format` を選んだ場合のみ）
   - `prettier`
   - `oxfmt`

3. **Test runner**（`test` を選んだ場合のみ）
   - `jest`
   - `vitest`
   - `skip`

4. **AI tools**（AI rules guidance を選んだ場合のみ）
   - Claude
   - Codex
   - Gemini

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

lint + format のみ追加:

```bash
npx @tylercore/treg add
```

その後 `lint` と `format` を選択。

`oxfmt` で format を追加:

```bash
npx @tylercore/treg add
```

その後 `format` を選び、続けて `oxfmt` を選択。

`vitest` で test を追加:

```bash
npx @tylercore/treg add
```

その後 `test` を選び、続けて `vitest` を選択。

---

## CLI オプション

### `init`

```text
--dry-run
--help
```

### `add`

対話モード:

```text
add
```

自動化用の任意フラグ:

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

`Treg` は、選択したツールに対応する AI ガイダンスファイルを更新できます。

| Tool   | File        |
| ------ | ----------- |
| Claude | `CLAUDE.md` |
| Codex  | `AGENTS.md` |
| Gemini | `GEMINI.md` |

挙動:

- 選択したツールのみ更新
- 対象ファイルがない場合は自動作成
- 更新はリポジトリルートで実行
- プロンプトは選択した各 AI ガイダンス文書へ直接書き込み

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
