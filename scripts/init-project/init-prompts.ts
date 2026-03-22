import { stdin as input, stdout as output } from "node:process"
import type {
  AiTool,
  EnabledFeatures,
  FeatureName,
  Formatter,
  PackageManager,
  TestRunner,
} from "./types.ts"

const DEFAULT_AI_TOOLS: readonly AiTool[] = ["claude", "codex", "gemini"]

type InitPromptFeature = FeatureName | "skills"
type AiToolChoice = AiTool | "skip"
type ClackPrompts = typeof import("@clack/prompts")

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

const AI_TOOL_CHOICES: readonly Choice<AiToolChoice>[] = [
  { value: "claude", label: "Claude" },
  { value: "codex", label: "Codex" },
  { value: "gemini", label: "Gemini" },
  { value: "skip", label: "skip (disable AI skill guidance)" },
]

const FEATURE_CHOICES: readonly Choice<InitPromptFeature>[] = [
  { value: "lint", label: "lint" },
  { value: "format", label: "format" },
  { value: "typescript", label: "TypeScript" },
  { value: "test", label: "test" },
  { value: "husky", label: "husky" },
  { value: "skills", label: "AI skill guidance" },
]

let promptsModulePromise: Promise<ClackPrompts> | null = null

function toFeatureSelection(
  selected: readonly InitPromptFeature[]
): InitFeatureSelection {
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

function mapChoiceOptions<T extends string>(choices: readonly Choice<T>[]) {
  return choices.map(choice => ({ value: choice, label: choice.label }))
}

function unwrapPromptResult<T>(
  value: T | symbol,
  prompts: Pick<ClackPrompts, "cancel" | "isCancel">
): T {
  if (prompts.isCancel(value)) {
    prompts.cancel("Prompt cancelled by user")
    throw new Error("Prompt cancelled by user")
  }

  return value as T
}

async function getPrompts(): Promise<ClackPrompts> {
  if (!promptsModulePromise) {
    promptsModulePromise = import("@clack/prompts")
  }

  return promptsModulePromise
}

async function promptSingleChoice<T extends string>(
  message: string,
  choices: readonly Choice<T>[],
  defaultValue: T
): Promise<T> {
  const prompts = await getPrompts()
  const defaultChoice = choices.find(choice => choice.value === defaultValue)
  const options = {
    message,
    options: mapChoiceOptions(choices),
  }

  const result = await prompts.select<Choice<T>>(
    defaultChoice ? { ...options, initialValue: defaultChoice } : options
  )

  return unwrapPromptResult(result, prompts).value
}

function resolveAiToolSelection(selected: readonly AiToolChoice[]): {
  skills: boolean
  aiTools: AiTool[]
} {
  if (selected.includes("skip")) {
    return {
      skills: false,
      aiTools: [],
    }
  }

  return {
    skills: selected.length > 0,
    aiTools: selected as AiTool[],
  }
}

async function promptMultiChoice<T extends string>(
  message: string,
  choices: readonly Choice<T>[],
  defaultValues: readonly T[],
  required = false
): Promise<T[]> {
  const prompts = await getPrompts()

  const result = await prompts.multiselect<Choice<T>>({
    message,
    options: mapChoiceOptions(choices),
    initialValues: choices.filter(choice =>
      defaultValues.includes(choice.value)
    ),
    required,
  })

  return unwrapPromptResult(result, prompts).map(choice => choice.value)
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

  console.log("\nInit setup")

  const pm = await promptSingleChoice(
    "1) Package manager",
    PACKAGE_MANAGER_CHOICES,
    defaults.pm
  )

  const featureAnswers = await promptMultiChoice(
    "2) Features",
    FEATURE_CHOICES,
    FEATURE_CHOICES.map(choice => choice.value)
  )
  const featureSelection = toFeatureSelection(featureAnswers)

  let testRunner = defaults.testRunner
  const enabledFeatures = { ...featureSelection.enabledFeatures }

  if (featureSelection.enabledFeatures.test) {
    const selectedTestRunner = await promptSingleChoice(
      "3) Test runner",
      TEST_RUNNER_CHOICES,
      defaults.testRunner
    )

    if (selectedTestRunner === "skip") {
      enabledFeatures.test = false
      console.log("Test feature disabled by selection: skip")
    } else {
      testRunner = selectedTestRunner
    }
  } else {
    console.log("3) Test runner skipped (test feature not selected)")
  }

  let formatter = defaults.formatter
  if (featureSelection.enabledFeatures.format) {
    formatter = await promptSingleChoice(
      "4) Formatter",
      FORMATTER_CHOICES,
      defaults.formatter
    )
  } else {
    console.log("4) Formatter skipped (format feature not selected)")
  }

  let aiTools: AiTool[] = []
  let skills = featureSelection.skills

  if (skills) {
    const aiToolAnswers = await promptMultiChoice(
      "5) AI tools (Space to select, A to toggle all)",
      AI_TOOL_CHOICES,
      [],
      true
    )
    const aiToolSelection = resolveAiToolSelection(aiToolAnswers)
    skills = aiToolSelection.skills
    aiTools = aiToolSelection.aiTools
    if (!skills) {
      console.log("AI skill guidance disabled by selection: skip")
    }
  } else {
    console.log("5) AI tools skipped (AI skill guidance not selected)")
  }

  return {
    pm,
    formatter,
    testRunner,
    enabledFeatures,
    skills,
    aiTools,
  }
}

export const __testables__ = {
  toFeatureSelection,
  resolveAiToolSelection,
}
