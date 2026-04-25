import { existsSync } from "node:fs"
import path from "node:path"
import { stdin as input, stdout as output } from "node:process"
import type {
  AiTool,
  EnabledFeatures,
  FeatureName,
  Formatter,
  FrameworkId,
  PackageManager,
  PackagePresetId,
  TestRunner,
} from "./types.ts"
import { getPackagePresets } from "./frameworks/packages.ts"

const DEFAULT_AI_TOOLS: readonly AiTool[] = ["claude", "codex", "gemini"]
const AI_TOOL_DOCS: Record<AiTool, string> = {
  claude: "CLAUDE.md",
  codex: "AGENTS.md",
  gemini: "GEMINI.md",
}

type InitPromptFeature = FeatureName | "aiRules"
type AiToolChoice = AiTool | "skip"
type PackageInstallChoice = "yes" | "no"
type ClackPrompts = typeof import("@clack/prompts")

interface Choice<T extends string> {
  value: T
  label: string
}

interface InitFeatureSelection {
  enabledFeatures: EnabledFeatures
  aiRules: boolean
}

export interface InitPromptResult {
  pm: PackageManager
  formatter: Formatter
  testRunner: TestRunner
  enabledFeatures: EnabledFeatures
  aiRules: boolean
  aiTools: AiTool[]
  selectedPackageIds: PackagePresetId[]
}

interface InitPromptDefaults {
  frameworkId: FrameworkId
  pm: PackageManager
  formatter: Formatter
  testRunner: TestRunner
}

export interface AddPromptResult {
  formatter: Formatter
  testRunner: TestRunner
  enabledFeatures: EnabledFeatures
  aiRules: boolean
  aiTools: AiTool[]
}

interface AddPromptDefaults {
  projectDir: string
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
  { value: "skip", label: "skip (disable AI rules guidance)" },
]

const PACKAGE_INSTALL_CHOICES: readonly Choice<PackageInstallChoice>[] = [
  { value: "no", label: "No" },
  { value: "yes", label: "Yes" },
]

const FEATURE_CHOICES: readonly Choice<InitPromptFeature>[] = [
  { value: "lint", label: "lint" },
  { value: "format", label: "format" },
  { value: "typescript", label: "TypeScript" },
  { value: "test", label: "test" },
  { value: "husky", label: "husky" },
  { value: "aiRules", label: "AI rules guidance" },
]

let promptsModulePromise: Promise<ClackPrompts> | null = null

function toFeatureSelection(selected: readonly InitPromptFeature[]): InitFeatureSelection {
  return {
    enabledFeatures: {
      lint: selected.includes("lint"),
      format: selected.includes("format"),
      typescript: selected.includes("typescript"),
      test: selected.includes("test"),
      husky: selected.includes("husky"),
    },
    aiRules: selected.includes("aiRules"),
  }
}

function mapChoiceOptions<T extends string>(choices: readonly Choice<T>[]) {
  return choices.map((choice) => ({ value: choice, label: choice.label }))
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
  const defaultChoice = choices.find((choice) => choice.value === defaultValue)
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
  aiRules: boolean
  aiTools: AiTool[]
} {
  if (selected.includes("skip")) {
    return {
      aiRules: false,
      aiTools: [],
    }
  }

  return {
    aiRules: selected.length > 0,
    aiTools: selected as AiTool[],
  }
}

function resolveExistingAiTools(
  projectDir: string,
  aiTools: readonly AiTool[] = DEFAULT_AI_TOOLS
): AiTool[] {
  return aiTools.filter((tool) => existsSync(path.join(projectDir, AI_TOOL_DOCS[tool])))
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
    initialValues: choices.filter((choice) => defaultValues.includes(choice.value)),
    required,
  })

  return unwrapPromptResult(result, prompts).map((choice) => choice.value)
}

export async function collectInitPrompts(defaults: InitPromptDefaults): Promise<InitPromptResult> {
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
      aiRules: true,
      aiTools: [...DEFAULT_AI_TOOLS],
      selectedPackageIds: [],
    }
  }

  console.log("\nInit setup")

  const pm = await promptSingleChoice("1) Package manager", PACKAGE_MANAGER_CHOICES, defaults.pm)

  const featureAnswers = await promptMultiChoice(
    "2) Features",
    FEATURE_CHOICES,
    FEATURE_CHOICES.map((choice) => choice.value)
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
    formatter = await promptSingleChoice("4) Formatter", FORMATTER_CHOICES, defaults.formatter)
  } else {
    console.log("4) Formatter skipped (format feature not selected)")
  }

  let aiTools: AiTool[] = []
  let aiRules = featureSelection.aiRules

  if (aiRules) {
    const aiToolAnswers = await promptMultiChoice(
      "5) AI tools (Space to select, A to toggle all)",
      AI_TOOL_CHOICES,
      [],
      true
    )
    const aiToolSelection = resolveAiToolSelection(aiToolAnswers)
    aiRules = aiToolSelection.aiRules
    aiTools = aiToolSelection.aiTools
    if (!aiRules) {
      console.log("AI rules guidance disabled by selection: skip")
    }
  } else {
    console.log("5) AI tools skipped (AI rules guidance not selected)")
  }

  let selectedPackageIds: PackagePresetId[] = []
  const shouldInstallPackages = await promptSingleChoice(
    "6) Install common packages",
    PACKAGE_INSTALL_CHOICES,
    "no"
  )
  if (shouldInstallPackages === "yes") {
    const packageChoices = getPackagePresets(defaults.frameworkId).map((preset) => ({
      value: preset.id,
      label: `${preset.label} - ${preset.description}`,
    }))
    selectedPackageIds = await promptMultiChoice(
      "7) Common packages (Space to select, A to toggle all)",
      packageChoices,
      [],
      true
    )
  } else {
    console.log("7) Common packages skipped")
  }

  return {
    pm,
    formatter,
    testRunner,
    enabledFeatures,
    aiRules,
    aiTools,
    selectedPackageIds,
  }
}

export async function collectAddPrompts(defaults: AddPromptDefaults): Promise<AddPromptResult> {
  const defaultAiTools = resolveExistingAiTools(defaults.projectDir)

  if (!input.isTTY || !output.isTTY) {
    console.log("Non-interactive shell detected. Use add defaults.")
    return {
      formatter: defaults.formatter,
      testRunner: defaults.testRunner,
      enabledFeatures: {
        lint: true,
        format: true,
        typescript: true,
        test: true,
        husky: true,
      },
      aiRules: defaultAiTools.length > 0,
      aiTools: defaultAiTools,
    }
  }

  console.log("\nAdd setup")

  const featureChoices =
    defaultAiTools.length > 0
      ? FEATURE_CHOICES
      : FEATURE_CHOICES.filter((choice) => choice.value !== "aiRules")
  const featureAnswers = await promptMultiChoice("1) Features", featureChoices, [], true)
  const featureSelection = toFeatureSelection(featureAnswers)

  let formatter = defaults.formatter
  if (featureSelection.enabledFeatures.format) {
    formatter = await promptSingleChoice("2) Formatter", FORMATTER_CHOICES, defaults.formatter)
  } else {
    console.log("2) Formatter skipped (format feature not selected)")
  }

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

  let aiTools: AiTool[] = []
  let aiRules = featureSelection.aiRules

  if (aiRules) {
    const aiToolChoices = AI_TOOL_CHOICES.filter(
      (choice) => choice.value === "skip" || defaultAiTools.includes(choice.value)
    )
    const aiToolAnswers = await promptMultiChoice(
      "4) AI tools (Space to select, A to toggle all)",
      aiToolChoices,
      defaultAiTools,
      true
    )
    const aiToolSelection = resolveAiToolSelection(aiToolAnswers)
    aiRules = aiToolSelection.aiRules
    aiTools = aiToolSelection.aiTools
    if (!aiRules) {
      console.log("AI rules guidance disabled by selection: skip")
    }
  } else {
    console.log(
      defaultAiTools.length > 0
        ? "4) AI tools skipped (AI rules guidance not selected)"
        : "4) AI tools skipped (no AI rules files found)"
    )
  }

  return {
    formatter,
    testRunner,
    enabledFeatures,
    aiRules,
    aiTools,
  }
}

export const __testables__ = {
  resolveExistingAiTools,
  toFeatureSelection,
  resolveAiToolSelection,
}
