import { getPackagePresets, getSelectedPackagePresets } from "../frameworks/packages.ts"
import type {
  EnabledFeatures,
  FeatureName,
  Framework,
  PackagePresetId,
  RuleContext,
  TestRunner,
} from "../types.ts"

import { existsSync } from "node:fs"
import { promises as fs } from "node:fs"
import path from "node:path"

const RULE_SECTION_START_PATTERN = "### Git rules\n\n1. Never use --no-verify"
const AGENTS_REFERENCE = "@AGENTS.md"
const AI_RULE_DOCS = {
  agents: "AGENTS.md",
  claude: "CLAUDE.md",
  gemini: "GEMINI.md",
} as const

interface AiRulesTarget {
  filePath: string
  mode: "rules" | "agentsReference"
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
const PACKAGE_SECTION_HEADING = "### Package Rules and Checklist"

async function fileContainsAgentsReference(filePath: string): Promise<boolean> {
  if (!existsSync(filePath)) {
    return false
  }

  const content = await fs.readFile(filePath, "utf8")
  return content.includes(AGENTS_REFERENCE)
}

async function resolveAiRulesDocs(projectDir: string): Promise<AiRulesTarget[]> {
  const agentsPath = path.join(projectDir, AI_RULE_DOCS.agents)
  const claudePath = path.join(projectDir, AI_RULE_DOCS.claude)
  const geminiPath = path.join(projectDir, AI_RULE_DOCS.gemini)
  const paths = [agentsPath, claudePath, geminiPath]
  const existingPaths = paths.filter((filePath) => existsSync(filePath))

  if (existingPaths.length === 0) {
    return [
      { filePath: agentsPath, mode: "rules" },
      { filePath: claudePath, mode: "agentsReference" },
      { filePath: geminiPath, mode: "agentsReference" },
    ]
  }

  const claudeDelegates = await fileContainsAgentsReference(claudePath)
  const geminiDelegates = await fileContainsAgentsReference(geminiPath)
  const targets: AiRulesTarget[] = []

  if (existsSync(agentsPath) || claudeDelegates || geminiDelegates) {
    targets.push({ filePath: agentsPath, mode: "rules" })
  }

  if (existsSync(claudePath) && !claudeDelegates) {
    targets.push({ filePath: claudePath, mode: "rules" })
  }

  if (existsSync(geminiPath) && !geminiDelegates) {
    targets.push({ filePath: geminiPath, mode: "rules" })
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

function readPackageIdsFromRuleSection(content: string, framework: Framework): PackagePresetId[] {
  const section = extractRuleSection(content)
  if (!section) {
    return []
  }

  const packageHeadingStart = section.indexOf(PACKAGE_SECTION_HEADING)
  if (packageHeadingStart === -1) {
    return []
  }

  const packageSection = section.slice(packageHeadingStart)
  const packageIdsByLabel = new Map(
    getPackagePresets(framework.id).map((preset) => [preset.label, preset.id])
  )
  const enabled = new Set<PackagePresetId>()
  const matches = packageSection.matchAll(/^\d+\.\s+(.+)$/gm)
  for (const match of matches) {
    const label = match[1]?.trim()
    if (!label) continue
    const packageId = packageIdsByLabel.get(label)
    if (packageId) {
      enabled.add(packageId)
    }
  }

  return [...enabled].sort((a, b) => a.localeCompare(b))
}

function mergePackageIds(
  current: PackagePresetId[],
  incoming: PackagePresetId[]
): PackagePresetId[] {
  return [...new Set([...current, ...incoming])].sort((a, b) => a.localeCompare(b))
}

function buildRuleSection(
  context: Pick<RuleContext, "enabledFeatures" | "testRunner"> &
    Partial<Pick<RuleContext, "framework" | "selectedPackageIds">>
): string {
  const { enabledFeatures, testRunner } = context
  const enabled = getEnabledFeatures(enabledFeatures)
  const selectedPackagePresets =
    context.framework && context.selectedPackageIds
      ? getSelectedPackagePresets(context.framework.id, context.selectedPackageIds)
      : []

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

  if (selectedPackagePresets.length > 0) {
    lines.push(PACKAGE_SECTION_HEADING)
    lines.push("")

    selectedPackagePresets.forEach((preset, index) => {
      lines.push(`${index + 1}. ${preset.label}`)
      lines.push(`   - Prompt: ${preset.aiRule.prompt}`)
      lines.push(`   - When to use: ${preset.aiRule.when}`)
      lines.push("   - Checklist:")
      preset.aiRule.checklist.forEach((item) => {
        lines.push(`     - ${item}`)
      })
      lines.push("")
    })
  }

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

function upsertAgentsReference(content: string): string {
  if (content.includes(AGENTS_REFERENCE)) {
    return content
  }

  if (!content.trim()) {
    return `${AGENTS_REFERENCE}\n`
  }

  return `${content.trimEnd()}\n\n${AGENTS_REFERENCE}\n`
}

export async function runAiRulesRule(context: RuleContext): Promise<void> {
  const { dryRun } = context
  const targets = await resolveAiRulesDocs(context.projectDir)
  const currentFeatures = getEnabledFeatures(context.enabledFeatures)

  for (const target of targets) {
    const targetFile = target.filePath
    if (dryRun) {
      const action = existsSync(targetFile) ? "update" : "create"
      const contentLabel =
        target.mode === "rules" ? "AI rules content" : `${AGENTS_REFERENCE} reference`
      console.log(`[dry-run] Would ${action} ${path.basename(targetFile)} with ${contentLabel}`)
      continue
    }

    const exists = existsSync(targetFile)
    const current = exists ? await fs.readFile(targetFile, "utf8") : ""
    if (target.mode === "agentsReference") {
      const updated = upsertAgentsReference(current)
      if (updated !== current) {
        await fs.mkdir(path.dirname(targetFile), { recursive: true })
        await fs.writeFile(targetFile, updated, "utf8")
        console.log(
          `${exists ? "Updated" : "Created"} ${path.basename(targetFile)} with ${AGENTS_REFERENCE} reference`
        )
        continue
      }

      console.log(`${path.basename(targetFile)} already contains ${AGENTS_REFERENCE} reference`)
      continue
    }

    const existingFeatures = context.command === "add" ? readFeaturesFromRuleSection(current) : []
    const mergedFeatures = mergeFeatureNames(existingFeatures, currentFeatures)
    const existingPackageIds =
      context.command === "add" ? readPackageIdsFromRuleSection(current, context.framework) : []
    const mergedPackageIds = mergePackageIds(existingPackageIds, context.selectedPackageIds)
    const hasNewTestConfig = context.command !== "add" || context.enabledFeatures.test
    const testRunner = hasNewTestConfig
      ? context.testRunner
      : (readTestRunnerFromRuleSection(current) ?? context.testRunner)
    const section = buildRuleSection({
      enabledFeatures: buildEnabledFeatureState(mergedFeatures),
      framework: context.framework,
      selectedPackageIds: mergedPackageIds,
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
  readPackageIdsFromRuleSection,
  resolveAiRulesDocs,
  upsertAgentsReference,
  upsertRuleSection,
}
