import type { AiTool, EnabledFeatures, FeatureName, RuleContext, TestRunner } from "../types.ts"

import { existsSync } from "node:fs"
import { promises as fs } from "node:fs"
import path from "node:path"

const RULE_SECTION_START_PATTERN = "### Git rules\n\n1. Never use --no-verify"
const AI_TOOL_DOCS: Record<AiTool, string> = {
  claude: "CLAUDE.md",
  codex: "AGENTS.md",
  gemini: "GEMINI.md",
}

interface FeatureGuidance {
  prompt: string
  when: string
  checklist: string[]
}

const FEATURE_GUIDANCE: Record<FeatureName, FeatureGuidance> = {
  format: {
    prompt: "Apply and verify formatting rule.",
    when: "Before committing or after broad edits, normalize formatting across the codebase.",
    checklist: [
      "Run `format`.",
      "Run `format:check`.",
      "Confirm only intended files were changed.",
    ],
  },
  husky: {
    prompt: "Apply and verify git hook rule.",
    when: "When pre-commit and pre-push checks must stay enforced and consistent.",
    checklist: [
      "Ensure hooks are executable.",
      "Ensure hooks include `format:check` and `lint:check`.",
      "If type-checking or tests are enabled, ensure those checks are included.",
    ],
  },
  lint: {
    prompt: "Run and validate lint rule.",
    when: "After adding rules or changing tooling, verify lint consistency.",
    checklist: [
      "Run `lint`.",
      "Run `lint:check`.",
      "Fix max-warnings and remaining lint violations.",
    ],
  },
  test: {
    prompt: "Validate test runner setup and execution.",
    when: "When test rules are added or test configuration changes.",
    checklist: [
      "Confirm the selected test runner matches the project setup.",
      "Run `test`.",
      "Run `test:coverage` when coverage validation is needed.",
    ],
  },
  typescript: {
    prompt: "Validate TypeScript strictness and config.",
    when: "When tsconfig or strict typing rules are changed.",
    checklist: [
      "Run `type:check`.",
      "Confirm strict compiler options remain enabled.",
      "Ensure `exclude` does not hide product-logic paths.",
    ],
  },
}

const FEATURE_STEP_LABELS: Record<FeatureName, string> = {
  format: "Formatting",
  husky: "Git Hook Maintenance",
  lint: "Lint Validation",
  test: "Test Configuration",
  typescript: "TypeScript Settings",
}
const FEATURE_NAME_BY_STEP_LABEL = Object.entries(FEATURE_STEP_LABELS).reduce(
  (acc, [feature, label]) => {
    acc[label] = feature as FeatureName
    return acc
  },
  {} as Record<string, FeatureName>
)
const TEST_RUNNER_PATTERN = /Current test runner:\s+`(jest|vitest)`/

function resolveAiRulesDocs(
  context: Pick<RuleContext, "projectDir" | "aiTools" | "command">
): string[] {
  const { projectDir, aiTools, command } = context
  const docFiles = [...new Set(aiTools.map((tool) => AI_TOOL_DOCS[tool]))]
  const targets = docFiles.map((fileName) => path.join(projectDir, fileName))

  if (command === "add") {
    return targets.filter((target) => existsSync(target))
  }

  return targets
}

function getEnabledFeatures(enabledFeatures: EnabledFeatures): FeatureName[] {
  return (Object.entries(enabledFeatures) as Array<[FeatureName, boolean]>)
    .filter(([, value]) => value)
    .map(([name]) => name)
    .sort((a, b) => a.localeCompare(b))
}

function buildEnabledFeatureState(features: FeatureName[]): EnabledFeatures {
  const enabled = new Set(features)
  return {
    lint: enabled.has("lint"),
    format: enabled.has("format"),
    typescript: enabled.has("typescript"),
    test: enabled.has("test"),
    husky: enabled.has("husky"),
  }
}

function extractRuleSection(content: string): string | null {
  const headingStart = content.indexOf(RULE_SECTION_START_PATTERN)
  if (headingStart === -1) {
    return null
  }
  const nextHeading = content.indexOf("\n## ", headingStart + 1)
  const sectionEnd = nextHeading === -1 ? content.length : nextHeading + 1
  return content.slice(headingStart, sectionEnd)
}

function readFeaturesFromRuleSection(content: string): FeatureName[] {
  const section = extractRuleSection(content)
  if (!section) {
    return []
  }

  const enabled = new Set<FeatureName>()
  const matches = section.matchAll(/^\d+\.\s+(.+)$/gm)
  for (const match of matches) {
    const label = match[1]?.trim()
    if (!label) continue
    const feature = FEATURE_NAME_BY_STEP_LABEL[label]
    if (feature) {
      enabled.add(feature)
    }
  }

  return [...enabled].sort((a, b) => a.localeCompare(b))
}

function readTestRunnerFromRuleSection(content: string): TestRunner | null {
  const section = extractRuleSection(content)
  if (!section) {
    return null
  }
  const matched = section.match(TEST_RUNNER_PATTERN)
  if (!matched || (matched[1] !== "jest" && matched[1] !== "vitest")) {
    return null
  }
  return matched[1]
}

function mergeFeatureNames(current: FeatureName[], incoming: FeatureName[]): FeatureName[] {
  return [...new Set([...current, ...incoming])].sort((a, b) => a.localeCompare(b))
}

function buildRuleSection(context: Pick<RuleContext, "enabledFeatures" | "testRunner">): string {
  const { enabledFeatures, testRunner } = context
  const enabled = getEnabledFeatures(enabledFeatures)

  const lines = [
    "### Git rules",
    "",
    "1. Never use --no-verify",
    "2. Unless the user asks, never relax TypeScript, lint, or format constraints, and never skip tests.",
    "",
    "### Validation Rules and Checklist",
    "",
  ]

  if (enabled.length === 0) {
    lines.push("1. No features are enabled in this run, so no rule call is required.")
    lines.push("")
    return lines.join("\n")
  }

  enabled.forEach((feature, index) => {
    const guidance = FEATURE_GUIDANCE[feature]
    if (!guidance) return

    lines.push(`${index + 1}. ${FEATURE_STEP_LABELS[feature]}`)
    lines.push(`   - Prompt: ${guidance.prompt}`)
    lines.push(`   - When to use: ${guidance.when}`)
    if (feature === "test") {
      lines.push(`   - Current test runner: \`${testRunner}\``)
    }
    lines.push("   - Checklist:")
    guidance.checklist.forEach((item) => {
      lines.push(`     - ${item}`)
    })
    lines.push("")
  })

  return lines.join("\n")
}

function upsertRuleSection(content: string, nextSection: string): string {
  const replaceSection = (start: number, end: number): string => {
    const before = content.slice(0, start).trimEnd()
    const after = content.slice(end).trimStart()
    const rebuilt = `${before}\n\n${nextSection.trim()}\n`
    return after ? `${rebuilt}\n${after}\n` : `${rebuilt}`
  }

  const headingStart = content.indexOf(RULE_SECTION_START_PATTERN)

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
  const { dryRun } = context
  const targetFiles = resolveAiRulesDocs(context)
  const currentFeatures = getEnabledFeatures(context.enabledFeatures)

  for (const targetFile of targetFiles) {
    if (dryRun) {
      const action = existsSync(targetFile) ? "update" : "create"
      console.log(`[dry-run] Would ${action} ${path.basename(targetFile)} with AI rules content`)
      continue
    }

    const exists = existsSync(targetFile)
    const current = exists ? await fs.readFile(targetFile, "utf8") : ""
    const existingFeatures = context.command === "add" ? readFeaturesFromRuleSection(current) : []
    const mergedFeatures = mergeFeatureNames(existingFeatures, currentFeatures)
    const hasNewTestConfig = context.command !== "add" || context.enabledFeatures.test
    const testRunner = hasNewTestConfig
      ? context.testRunner
      : (readTestRunnerFromRuleSection(current) ?? context.testRunner)
    const section = buildRuleSection({
      enabledFeatures: buildEnabledFeatureState(mergedFeatures),
      testRunner,
    })
    const updated = upsertRuleSection(current, section)

    if (updated !== current) {
      await fs.mkdir(path.dirname(targetFile), { recursive: true })
      await fs.writeFile(targetFile, updated, "utf8")
      console.log(
        `${exists ? "Updated" : "Created"} ${path.basename(targetFile)} with AI rules content`
      )
      continue
    }

    console.log(`${path.basename(targetFile)} already contains latest AI rules content`)
  }
}

export const __testables__ = {
  buildRuleSection,
  getEnabledFeatures,
  resolveAiRulesDocs,
  upsertRuleSection,
}
