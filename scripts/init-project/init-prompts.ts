import { stdin as input, stdout as output } from "node:process"
import { createInterface } from "node:readline/promises"
import type {
  AiTool,
  EnabledFeatures,
  FeatureName,
  Formatter,
  PackageManager,
  TestRunner,
} from "./types.ts"

const DEFAULT_AI_TOOLS: readonly AiTool[] = ["claude", "codex", "gemini"]

type InitPromptFeature = FeatureName | "skills" | "all"

interface Choice<T extends string> {
  value: T
  label: string
}

interface InitFeatureSelection {
  enabledFeatures: EnabledFeatures
  skills: boolean
}

export interface InitPromptResult {
  pm: PackageManager
  formatter: Formatter
  testRunner: TestRunner
  enabledFeatures: EnabledFeatures
  skills: boolean
  aiTools: AiTool[]
}

interface InitPromptDefaults {
  pm: PackageManager
  formatter: Formatter
  testRunner: TestRunner
}

interface ParseResult<T> {
  ok: boolean
  value?: T
  error?: string
}

const PACKAGE_MANAGER_CHOICES: readonly Choice<PackageManager>[] = [
  { value: "pnpm", label: "pnpm" },
  { value: "npm", label: "npm" },
  { value: "yarn", label: "yarn" },
  { value: "bun", label: "bun" },
]

type TestRunnerChoice = TestRunner | "skip"

const TEST_RUNNER_CHOICES: readonly Choice<TestRunnerChoice>[] = [
  { value: "jest", label: "jest" },
  { value: "vitest", label: "vitest" },
  { value: "skip", label: "skip (disable test feature)" },
]

const FORMATTER_CHOICES: readonly Choice<Formatter>[] = [
  { value: "prettier", label: "prettier" },
  { value: "oxfmt", label: "oxfmt" },
]

const AI_TOOL_CHOICES: readonly Choice<AiTool>[] = [
  { value: "claude", label: "Claude" },
  { value: "codex", label: "Codex" },
  { value: "gemini", label: "Gemini" },
]

const FEATURE_CHOICES: readonly Choice<InitPromptFeature>[] = [
  {
    value: "all",
    label: "all (lint, format, TypeScript, test, husky, AI skill guidance)",
  },
  { value: "lint", label: "lint" },
  { value: "format", label: "format" },
  { value: "typescript", label: "TypeScript" },
  { value: "test", label: "test" },
  { value: "husky", label: "husky" },
  { value: "skills", label: "AI skill guidance" },
]

function formatChoices<T extends string>(
  choices: readonly Choice<T>[]
): string {
  return choices
    .map((choice, index) => `  ${index + 1}. ${choice.label}`)
    .join("\n")
}

function parseSingleChoice<T extends string>(
  rawInput: string,
  choices: readonly Choice<T>[],
  defaultValue: T
): ParseResult<T> {
  const normalized = rawInput.trim().toLowerCase()
  if (!normalized) {
    return { ok: true, value: defaultValue }
  }

  const byIndex = Number.parseInt(normalized, 10)
  if (!Number.isNaN(byIndex) && String(byIndex) === normalized) {
    const selected = choices[byIndex - 1]
    if (selected) {
      return { ok: true, value: selected.value }
    }
  }

  const byValue = choices.find(choice => choice.value === normalized)
  if (byValue) {
    return { ok: true, value: byValue.value }
  }

  return {
    ok: false,
    error: `Invalid input: ${rawInput}. Please enter a listed number or option name.`,
  }
}

function parseMultiChoice<T extends string>(
  rawInput: string,
  choices: readonly Choice<T>[],
  defaultValues: readonly T[]
): ParseResult<T[]> {
  const normalized = rawInput.trim().toLowerCase()
  if (!normalized) {
    return { ok: true, value: [...defaultValues] }
  }
  if (normalized === "skip" || normalized === "none") {
    return { ok: true, value: [] }
  }

  const tokens = normalized
    .split(",")
    .map(item => item.trim())
    .filter(Boolean)

  if (tokens.length === 0) {
    return { ok: false, error: "Please enter at least one option." }
  }

  const selected = new Set<T>()
  for (const token of tokens) {
    const byIndex = Number.parseInt(token, 10)
    if (!Number.isNaN(byIndex) && String(byIndex) === token) {
      const item = choices[byIndex - 1]
      if (!item) {
        return {
          ok: false,
          error: `Invalid index: ${token}. Please choose from listed options.`,
        }
      }
      selected.add(item.value)
      continue
    }

    const byValue = choices.find(choice => choice.value === token)
    if (!byValue) {
      return {
        ok: false,
        error: `Invalid option: ${token}. Please choose from listed options.`,
      }
    }
    selected.add(byValue.value)
  }

  return { ok: true, value: [...selected] }
}

function toFeatureSelection(
  selected: readonly InitPromptFeature[]
): InitFeatureSelection {
  if (selected.includes("all")) {
    return {
      enabledFeatures: {
        lint: true,
        format: true,
        typescript: true,
        test: true,
        husky: true,
      },
      skills: true,
    }
  }

  return {
    enabledFeatures: {
      lint: selected.includes("lint"),
      format: selected.includes("format"),
      typescript: selected.includes("typescript"),
      test: selected.includes("test"),
      husky: selected.includes("husky"),
    },
    skills: selected.includes("skills"),
  }
}

async function askUntilValid<T>(
  ask: (prompt: string) => Promise<string>,
  prompt: string,
  parser: (value: string) => ParseResult<T>
): Promise<T> {
  while (true) {
    const raw = await ask(prompt)
    const parsed = parser(raw)
    if (parsed.ok && parsed.value !== undefined) {
      return parsed.value
    }
    console.log(parsed.error ?? "Invalid input")
  }
}

export async function collectInitPrompts(
  defaults: InitPromptDefaults
): Promise<InitPromptResult> {
  if (!input.isTTY || !output.isTTY) {
    console.log("Non-interactive shell detected. Use init defaults.")
    return {
      pm: defaults.pm,
      formatter: defaults.formatter,
      testRunner: defaults.testRunner,
      enabledFeatures: {
        lint: true,
        format: true,
        typescript: true,
        test: true,
        husky: true,
      },
      skills: true,
      aiTools: [...DEFAULT_AI_TOOLS],
    }
  }

  const rl = createInterface({ input, output })

  try {
    console.log("\nInit setup")

    console.log("\n1) Package manager")
    console.log(formatChoices(PACKAGE_MANAGER_CHOICES))
    const pm = await askUntilValid(
      rl.question.bind(rl),
      `Select package manager [default: ${defaults.pm}]: `,
      answer => parseSingleChoice(answer, PACKAGE_MANAGER_CHOICES, defaults.pm)
    )

    console.log("\n2) Features")
    console.log(formatChoices(FEATURE_CHOICES))
    const featureAnswers = await askUntilValid(
      rl.question.bind(rl),
      "Select features (comma-separated, default: all): ",
      answer => parseMultiChoice(answer, FEATURE_CHOICES, ["all"])
    )
    const featureSelection = toFeatureSelection(featureAnswers)

    let testRunner = defaults.testRunner
    const enabledFeatures = { ...featureSelection.enabledFeatures }
    if (featureSelection.enabledFeatures.test) {
      console.log("\n3) Test runner")
      console.log(formatChoices(TEST_RUNNER_CHOICES))
      const selectedTestRunner = await askUntilValid(
        rl.question.bind(rl),
        `Select test runner [default: ${defaults.testRunner}, or skip]: `,
        answer =>
          parseSingleChoice(answer, TEST_RUNNER_CHOICES, defaults.testRunner)
      )

      if (selectedTestRunner === "skip") {
        enabledFeatures.test = false
        console.log("Test feature disabled by selection: skip")
      } else {
        testRunner = selectedTestRunner
      }
    } else {
      console.log("\n3) Test runner skipped (test feature not selected)")
    }

    let formatter = defaults.formatter
    if (featureSelection.enabledFeatures.format) {
      console.log("\n4) Formatter")
      console.log(formatChoices(FORMATTER_CHOICES))
      formatter = await askUntilValid(
        rl.question.bind(rl),
        `Select formatter [default: ${defaults.formatter}]: `,
        answer =>
          parseSingleChoice(answer, FORMATTER_CHOICES, defaults.formatter)
      )
    } else {
      console.log("\n4) Formatter skipped (format feature not selected)")
    }

    let aiTools: AiTool[] = []
    let skills = featureSelection.skills

    if (skills) {
      console.log("\n5) AI tools")
      console.log(formatChoices(AI_TOOL_CHOICES))
      console.log("Type 'skip' to disable AI skill guidance.")
      aiTools = await askUntilValid(
        rl.question.bind(rl),
        "Select AI tools (comma-separated, default: all): ",
        answer => parseMultiChoice(answer, AI_TOOL_CHOICES, DEFAULT_AI_TOOLS)
      )
      if (aiTools.length === 0) {
        skills = false
      }
    } else {
      console.log("\n5) AI tools skipped (AI skill guidance not selected)")
    }

    return {
      pm,
      formatter,
      testRunner,
      enabledFeatures,
      skills,
      aiTools,
    }
  } finally {
    rl.close()
  }
}

export const __testables__ = {
  parseSingleChoice,
  parseMultiChoice,
  toFeatureSelection,
}
