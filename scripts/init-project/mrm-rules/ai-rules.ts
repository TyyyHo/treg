import type {
  AiTool,
  EnabledFeatures,
  FeatureName,
  RuleContext,
  TestRunner,
} from "../types.ts"

import { existsSync } from "node:fs"
import { promises as fs } from "node:fs"
import path from "node:path"

const SKILL_SECTION_HEADING = "## Treg AI Rules"
const LEGACY_SKILL_SECTION_HEADINGS = ["## Treg AI Guide", "## Treg AI Skills"]
const SKILLS_BASE_DIR = "skills"
const AI_TOOL_DOCS: Record<AiTool, string> = {
  claude: "CLAUDE.md",
  codex: "AGENTS.md",
  gemini: "GEMINI.md",
}

interface SkillDefinition {
  name: string
  description: string
  when: string
  checklist: string[]
}

const FEATURE_SKILLS: Record<FeatureName, SkillDefinition> = {
  format: {
    name: "Treg/format",
    description: "Run and verify formatting rules.",
    when: "Before committing or after broad edits, normalize formatting across the codebase.",
    checklist: [
      "Run `format`.",
      "Run `format:check`.",
      "Confirm only intended files were changed.",
    ],
  },
  husky: {
    name: "Treg/husky",
    description: "Verify and maintain git hook automation.",
    when: "When pre-commit and pre-push checks must stay enforced and consistent.",
    checklist: [
      "Ensure hooks are executable.",
      "Ensure hooks include `format:check` and `lint:check`.",
      "If type-checking or tests are enabled, ensure those checks are included.",
    ],
  },
  lint: {
    name: "Treg/lint",
    description: "Run and validate lint rules.",
    when: "After adding rules or changing tooling, verify lint consistency.",
    checklist: [
      "Run `lint`.",
      "Run `lint:check`.",
      "Fix max-warnings and remaining lint violations.",
    ],
  },
  test: {
    name: "Treg/test",
    description: "Validate test runner setup and execution.",
    when: "When test rules are added or test configuration changes.",
    checklist: [
      "Confirm the selected test runner matches the project setup.",
      "Run `test`.",
      "Run `test:coverage` when coverage validation is needed.",
    ],
  },
  typescript: {
    name: "Treg/typescript",
    description: "Validate TypeScript strictness and config.",
    when: "When tsconfig or strict typing rules are changed.",
    checklist: [
      "Run `type:check`.",
      "Confirm strict compiler options remain enabled.",
      "Ensure `exclude` does not hide product-logic paths.",
    ],
  },
}

const FEATURE_STEP_LABELS = {
  format: "Formatting",
  husky: "Git Hook Maintenance",
  lint: "Lint Validation",
  test: "Test Configuration",
  typescript: "TypeScript Settings",
}

function resolveSkillsDocs(projectDir: string, aiTools: AiTool[]): string[] {
  const docFiles = [...new Set(aiTools.map(tool => AI_TOOL_DOCS[tool]))]
  return docFiles.map(fileName => path.join(projectDir, fileName))
}

function getEnabledFeatures(enabledFeatures: EnabledFeatures): FeatureName[] {
  return (Object.entries(enabledFeatures) as Array<[FeatureName, boolean]>)
    .filter(([, value]) => value)
    .map(([name]) => name)
    .sort((a, b) => a.localeCompare(b))
}

function getSkillRelativePath(feature: FeatureName): string {
  return `${SKILLS_BASE_DIR}/${feature}/SKILL.md`
}

function buildSkillFile(
  feature: FeatureName,
  skill: SkillDefinition,
  testRunner: TestRunner
): string {
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

async function ensureSkillFiles(
  projectDir: string,
  enabled: FeatureName[],
  testRunner: TestRunner,
  dryRun: boolean
): Promise<void> {
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

function buildSkillSection(
  context: Pick<RuleContext, "enabledFeatures" | "testRunner">
): string {
  const { enabledFeatures, testRunner } = context
  const enabled = getEnabledFeatures(enabledFeatures)

  const lines = [
    SKILL_SECTION_HEADING,
    "",
    "### Git rules",
    "",
    "1. Never use --no-verify",
    "2. Unless the user asks, never relax TypeScript, lint, or format constraints, and never skip tests.",
    "",
    "### Steps and Skill Mapping",
    "",
  ]

  if (enabled.length === 0) {
    lines.push(
      "1. No features are enabled in this run, so no skill call is required."
    )
    lines.push("")
    return lines.join("\n")
  }

  enabled.forEach((feature, index) => {
    const skill = FEATURE_SKILLS[feature]
    if (!skill) return
    const skillRelativePath = getSkillRelativePath(feature)
    const stepLabel = FEATURE_STEP_LABELS[feature] ?? feature

    lines.push(
      `${index + 1}. ${stepLabel}: use [${skill.name}](${skillRelativePath})`
    )
    if (feature === "test") {
      lines.push(`   - Current test runner: \`${testRunner}\``)
    }
  })
  lines.push("")
  return lines.join("\n")
}

function upsertSkillSection(content: string, nextSection: string): string {
  const replaceSection = (start: number, end: number): string => {
    const before = content.slice(0, start).trimEnd()
    const after = content.slice(end).trimStart()
    const rebuilt = `${before}\n\n${nextSection.trim()}\n`
    return after ? `${rebuilt}\n${after}\n` : `${rebuilt}`
  }

  const headingStart =
    [SKILL_SECTION_HEADING, ...LEGACY_SKILL_SECTION_HEADINGS]
      .map(heading => content.indexOf(heading))
      .filter(index => index !== -1)
      .sort((a, b) => a - b)[0] ?? -1

  if (headingStart !== -1) {
    const nextHeading = content.indexOf("\n## ", headingStart + 1)
    const sectionEnd = nextHeading === -1 ? content.length : nextHeading + 1
    return replaceSection(headingStart, sectionEnd)
  }

  if (!content.trim()) {
    return `${nextSection.trim()}\n`
  }

  return `${content.trimEnd()}\n\n${nextSection.trim()}\n`
}

export async function runAiRulesRule(context: RuleContext): Promise<void> {
  const { projectDir, dryRun, aiTools } = context
  const targetFiles = resolveSkillsDocs(projectDir, aiTools)

  const enabled = getEnabledFeatures(context.enabledFeatures)
  await ensureSkillFiles(projectDir, enabled, context.testRunner, dryRun)

  const section = buildSkillSection(context)
  for (const targetFile of targetFiles) {
    if (dryRun) {
      const action = existsSync(targetFile) ? "update" : "create"
      console.log(
        `[dry-run] Would ${action} ${path.basename(targetFile)} with AI rules content`
      )
      continue
    }

    const exists = existsSync(targetFile)
    const current = exists ? await fs.readFile(targetFile, "utf8") : ""
    const updated = upsertSkillSection(current, section)

    if (updated !== current) {
      await fs.mkdir(path.dirname(targetFile), { recursive: true })
      await fs.writeFile(targetFile, updated, "utf8")
      console.log(
        `${exists ? "Updated" : "Created"} ${path.basename(targetFile)} with AI rules content`
      )
      continue
    }

    console.log(
      `${path.basename(targetFile)} already contains latest AI rules content`
    )
  }
}

export const __testables__ = {
  buildSkillSection,
  buildSkillFile,
  ensureSkillFiles,
  getEnabledFeatures,
  getSkillRelativePath,
  resolveSkillsDocs,
  upsertSkillSection,
}
