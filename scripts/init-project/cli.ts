import type {
  AiTool,
  CommandName,
  EnabledFeatures,
  FeatureName,
  Formatter,
  FrameworkId,
  ParsedOptions,
  TestRunner,
} from "./types.ts"

const ALLOWED_COMMANDS: readonly CommandName[] = ["init", "add", "list"]
const ALLOWED_FRAMEWORKS: readonly FrameworkId[] = [
  "node",
  "react",
  "next",
  "vue",
  "svelte",
  "nuxt",
]
const ALLOWED_FEATURES: readonly FeatureName[] = [
  "lint",
  "format",
  "typescript",
  "test",
  "husky",
]
const ALLOWED_TEST_RUNNERS: readonly TestRunner[] = ["jest", "vitest"]
const ALLOWED_FORMATTERS: readonly Formatter[] = ["prettier", "oxfmt"]
const DEFAULT_AI_TOOLS: readonly AiTool[] = ["claude", "codex", "gemini"]

export const USAGE = `Usage: treg <command> [options]

Commands:
  init                                Initialize infra rules in a project (interactive setup)
  add                                 Add selected infra features to an existing project
  list                                List supported frameworks, features, formatters, and test runners

Options:
  --dry-run                           Print planned changes without writing files
  -h, --help                          Show help

Add command options:
  --framework <node|react|next|vue|svelte|nuxt>
                                      Optional framework override (default: auto-detected)
  --features <lint,format,typescript,test,husky>
                                      Features to install (all selected by default)
  --dir <path>                        Target directory (defaults to current directory)
  --formatter <prettier|oxfmt>        Formatter for format feature (default: prettier)
  --test-runner <jest|vitest>         Optional test runner override (default: vue/nuxt=vitest, others=jest)
  --force                             Overwrite existing config files
  --skip-husky-install                Do not run husky install
`

interface RawParsedOptions {
  command: string
  projectDir: string | null
  framework: string | null
  formatter: string
  features: string[]
  testRunner: string | null
  force: boolean
  dryRun: boolean
  skipHuskyInstall: boolean
  skills: boolean
  aiTools: AiTool[]
  help: boolean
}

function includes<T extends string>(
  allowed: readonly T[],
  value: string
): value is T {
  return allowed.includes(value as T)
}

function isCommandName(value: string): value is CommandName {
  return includes(ALLOWED_COMMANDS, value)
}

function isFrameworkId(value: string): value is FrameworkId {
  return includes(ALLOWED_FRAMEWORKS, value)
}

function isFeatureName(value: string): value is FeatureName {
  return includes(ALLOWED_FEATURES, value)
}

function isTestRunner(value: string): value is TestRunner {
  return includes(ALLOWED_TEST_RUNNERS, value)
}

function isFormatter(value: string): value is Formatter {
  return includes(ALLOWED_FORMATTERS, value)
}

export function parseArgs(argv: string[]): ParsedOptions {
  const options: RawParsedOptions = {
    command: "init",
    projectDir: null,
    framework: null,
    formatter: "prettier",
    features: [],
    testRunner: null,
    force: false,
    dryRun: false,
    skipHuskyInstall: false,
    skills: true,
    aiTools: [...DEFAULT_AI_TOOLS],
    help: false,
  }

  let cursor = 0
  const firstArg = argv[0]
  if (firstArg && isCommandName(firstArg)) {
    options.command = firstArg
    cursor = 1
  }

  for (let i = cursor; i < argv.length; i += 1) {
    const arg = argv[i]
    if (!arg) {
      continue
    }

    if (arg === "-h" || arg === "--help") {
      options.help = true
      continue
    }
    if (arg === "--dry-run") {
      options.dryRun = true
      continue
    }

    if (options.command !== "add") {
      throw new Error(
        `Unsupported option for ${options.command}: ${arg}. Only --dry-run and --help are allowed.`
      )
    }

    if (arg === "--framework") {
      options.framework = readFlagValue(argv, i, "--framework")
      i += 1
    } else if (arg.startsWith("--framework=")) {
      options.framework = readInlineFlagValue(arg, "--framework")
    } else if (arg === "--features") {
      options.features.push(...parseCsvValue(argv[i + 1], "--features"))
      i += 1
    } else if (arg.startsWith("--features=")) {
      options.features.push(
        ...parseCsvValue(readInlineFlagValue(arg, "--features"), "--features")
      )
    } else if (arg === "--dir") {
      options.projectDir = readFlagValue(argv, i, "--dir")
      i += 1
    } else if (arg.startsWith("--dir=")) {
      options.projectDir = readInlineFlagValue(arg, "--dir")
    } else if (arg === "--formatter") {
      options.formatter = readFlagValue(argv, i, "--formatter")
      i += 1
    } else if (arg.startsWith("--formatter=")) {
      options.formatter = readInlineFlagValue(arg, "--formatter")
    } else if (arg === "--test-runner") {
      options.testRunner = readFlagValue(argv, i, "--test-runner")
      i += 1
    } else if (arg.startsWith("--test-runner=")) {
      options.testRunner = readInlineFlagValue(arg, "--test-runner")
    } else if (arg === "--force") {
      options.force = true
    } else if (arg === "--skip-husky-install") {
      options.skipHuskyInstall = true
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }

  validateParsedOptions(options)
  return options
}

function readFlagValue(
  argv: string[],
  index: number,
  flagName: string
): string {
  const value = argv[index + 1]
  if (!value) {
    throw new Error(`Missing value for ${flagName}`)
  }
  return value
}

function readInlineFlagValue(arg: string, flagName: string): string {
  const [, rawValue] = arg.split("=", 2)
  if (!rawValue) {
    throw new Error(`Missing value for ${flagName}`)
  }
  return rawValue
}

function parseCsvValue(
  rawValue: string | undefined,
  flagName: string
): string[] {
  if (!rawValue) {
    throw new Error(`Missing value for ${flagName}`)
  }

  return rawValue
    .split(",")
    .map(item => item.trim())
    .filter(Boolean)
}

function validateParsedOptions(
  options: RawParsedOptions
): asserts options is ParsedOptions {
  if (!isCommandName(options.command)) {
    throw new Error(`Unsupported command: ${options.command}`)
  }

  if (options.projectDir === "") {
    throw new Error("Missing value for --dir")
  }

  if (options.framework && !isFrameworkId(options.framework)) {
    throw new Error(`Unsupported framework: ${options.framework}`)
  }

  if (!isFormatter(options.formatter)) {
    throw new Error(`Unsupported formatter: ${options.formatter}`)
  }

  if (options.testRunner && !isTestRunner(options.testRunner)) {
    throw new Error(`Unsupported test runner: ${options.testRunner}`)
  }

  for (const feature of options.features) {
    if (!isFeatureName(feature)) {
      throw new Error(`Unsupported feature in --features: ${feature}`)
    }
  }
}

export function resolveFeatures(
  options: Pick<ParsedOptions, "features">
): EnabledFeatures {
  const selected = new Set<FeatureName>(
    options.features.length > 0 ? options.features : ALLOWED_FEATURES
  )

  return {
    lint: selected.has("lint"),
    format: selected.has("format"),
    typescript: selected.has("typescript"),
    test: selected.has("test"),
    husky: selected.has("husky"),
  }
}

export function printSupportedTargets() {
  console.log("Frameworks: node, react, next, vue, svelte, nuxt")
  console.log("Features: lint, format, typescript, test, husky")
  console.log("Formatters: prettier, oxfmt")
  console.log("Test runners: jest, vitest")
  console.log("Package managers: pnpm, npm, yarn, bun")
  console.log("AI tools: Claude, Codex, Gemini")
}

export function resolveTestRunner(
  frameworkId: FrameworkId,
  testRunner: TestRunner | null
): TestRunner {
  if (testRunner) {
    return testRunner
  }
  if (frameworkId === "vue" || frameworkId === "nuxt") {
    return "vitest"
  }
  return "jest"
}
