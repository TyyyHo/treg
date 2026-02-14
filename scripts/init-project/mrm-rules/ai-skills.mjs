import { existsSync } from "node:fs"
import { promises as fs } from "node:fs"
import path from "node:path"

const START_MARKER = "<!-- frontend-rules:skills:start -->"
const END_MARKER = "<!-- frontend-rules:skills:end -->"
const SKILLS_BASE_DIR = ".frontend-rules/skills"

const FEATURE_SKILLS = {
  format: {
    name: "frontend-rules/format",
    description: "Run and verify formatting rules.",
    when: "在提交前或大範圍改動後，統一格式化程式碼。",
    checklist: ["執行 format", "執行 format:check", "確認未變動非目標檔案"],
  },
  husky: {
    name: "frontend-rules/husky",
    description: "Verify and maintain git hook automation.",
    when: "需要保證 pre-commit / pre-push 自動檢查時。",
    checklist: [
      "確認 hooks 可執行",
      "確認含 format:check 與 lint:check",
      "若啟用型別/測試，也要納入 hooks",
    ],
  },
  lint: {
    name: "frontend-rules/lint",
    description: "Run and validate lint rules.",
    when: "新增規則或調整工具鏈後，驗證 lint 一致性。",
    checklist: ["執行 lint", "執行 lint:check", "修正 max-warnings 問題"],
  },
  test: {
    name: "frontend-rules/test",
    description: "Validate test runner setup and execution.",
    when: "新增測試規則或調整測試設定時。",
    checklist: [
      "確認 test runner 與專案一致",
      "執行 test",
      "視需要執行 test:coverage",
    ],
  },
  typescript: {
    name: "frontend-rules/typescript",
    description: "Validate TypeScript strictness and config.",
    when: "調整 tsconfig 或型別嚴格度規則時。",
    checklist: [
      "執行 type-check",
      "確認 strict 相關選項仍生效",
      "檢查 exclude 不含產品邏輯路徑",
    ],
  },
}

function resolveSkillsDoc(projectDir) {
  const agentsPath = path.join(projectDir, "AGENTS.md")
  if (existsSync(agentsPath)) {
    return agentsPath
  }

  const claudePath = path.join(projectDir, "CLAUDE.md")
  if (existsSync(claudePath)) {
    return claudePath
  }

  return null
}

function getEnabledFeatures(enabledFeatures) {
  return Object.entries(enabledFeatures)
    .filter(([, value]) => value)
    .map(([name]) => name)
    .sort((a, b) => a.localeCompare(b))
}

function getSkillRelativePath(feature) {
  return `${SKILLS_BASE_DIR}/${feature}/SKILL.md`
}

function buildSkillFile(feature, skill, testRunner) {
  const extra =
    feature === "test"
      ? `\n## Current Test Runner\n\n- \`${testRunner}\`\n`
      : ""
  return `---
name: ${skill.name}
description: ${skill.description}
---

# ${skill.name}

## When To Use

${skill.when}

## Validation Checklist

- ${skill.checklist.join("\n- ")}
${extra}`
}

async function ensureSkillFiles(projectDir, enabled, testRunner, dryRun) {
  for (const feature of enabled) {
    const skill = FEATURE_SKILLS[feature]
    if (!skill) continue

    const relativePath = getSkillRelativePath(feature)
    const fullPath = path.join(projectDir, relativePath)
    const content = buildSkillFile(feature, skill, testRunner)

    if (dryRun) {
      console.log(`[dry-run] Would upsert ${relativePath}`)
      continue
    }

    await fs.mkdir(path.dirname(fullPath), { recursive: true })
    const current = existsSync(fullPath)
      ? await fs.readFile(fullPath, "utf8")
      : null
    if (current === content) {
      continue
    }
    await fs.writeFile(fullPath, content, "utf8")
    console.log(`${current === null ? "Created" : "Updated"} ${relativePath}`)
  }
}

function buildSkillSection(context) {
  const { enabledFeatures, testRunner } = context
  const enabled = getEnabledFeatures(enabledFeatures)

  const lines = [
    START_MARKER,
    "## frontend-rules AI Skills",
    "",
    "以下 skill 可在 agent 任務完成前引用，確保基礎建設規則正確且可重跑：",
    "",
  ]

  for (const feature of enabled) {
    const skill = FEATURE_SKILLS[feature]
    if (!skill) continue
    const skillRelativePath = getSkillRelativePath(feature)

    lines.push(`### ${feature}`)
    lines.push(`- Skill: [${skill.name}](${skillRelativePath})`)
    lines.push(`- 使用時機: ${skill.when}`)
    if (feature === "test") {
      lines.push(`- 目前測試工具: \`${testRunner}\``)
    }
    lines.push(`- 驗證清單: ${skill.checklist.join("、")}`)
    lines.push("")
  }

  lines.push(END_MARKER)
  lines.push("")
  return lines.join("\n")
}

function upsertSkillSection(content, nextSection) {
  const start = content.indexOf(START_MARKER)
  const end = content.indexOf(END_MARKER)

  if (start !== -1 && end !== -1 && end > start) {
    const suffixStart = end + END_MARKER.length
    const before = content.slice(0, start).trimEnd()
    const after = content.slice(suffixStart).trimStart()
    const rebuilt = `${before}\n\n${nextSection.trim()}\n`
    return after ? `${rebuilt}\n${after}\n` : `${rebuilt}`
  }

  if (!content.trim()) {
    return `${nextSection.trim()}\n`
  }

  return `${content.trimEnd()}\n\n${nextSection.trim()}\n`
}

export async function runAiSkillsRule(context) {
  const { projectDir, dryRun } = context
  const targetFile = resolveSkillsDoc(projectDir)

  if (!targetFile) {
    console.log("Skip ai-skills (AGENTS.md/CLAUDE.md not found)")
    return
  }

  const enabled = getEnabledFeatures(context.enabledFeatures)
  await ensureSkillFiles(projectDir, enabled, context.testRunner, dryRun)

  const section = buildSkillSection(context)
  const current = await fs.readFile(targetFile, "utf8")
  const updated = upsertSkillSection(current, section)

  if (dryRun) {
    console.log(
      `[dry-run] Would update ${path.basename(targetFile)} with AI skill guidance`
    )
    return
  }

  if (updated !== current) {
    await fs.writeFile(targetFile, updated, "utf8")
    console.log(`Updated ${path.basename(targetFile)} with AI skill guidance`)
    return
  }

  console.log(
    `${path.basename(targetFile)} already contains latest AI skill guidance`
  )
}

export const __testables__ = {
  buildSkillSection,
  buildSkillFile,
  ensureSkillFiles,
  getEnabledFeatures,
  getSkillRelativePath,
  resolveSkillsDoc,
  upsertSkillSection,
}
