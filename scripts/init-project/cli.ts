import type {
  CommandName,
  EnabledFeatures,
  FeatureName,
  FrameworkId,
  PackageManagerOption,
  ParsedOptions,
  TestRunner,
} from "./types.ts"

const ALLOWED_COMMANDS: readonly CommandName[] = ["init", "add", "list"]
const ALLOWED_PACKAGE_MANAGERS: readonly PackageManagerOption[] = [
  "pnpm",
  "npm",
  "yarn",
  "auto",
]
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

export const USAGE = `Usage: treg <command> [options]

Commands:
  init                                Initialize infra rules in a project (framework auto-detected from dependencies)
  add                                 Add selected infra features to an existing project
  list                                List supported frameworks, features, and test runners

Options:
  --framework <node|react|next|vue|svelte|nuxt>
                                      Optional framework override (default: auto-detected)
  --features <lint,format,typescript,test,husky>
                                      Features to install (all selected by default)
  --dir <path>                        Target directory (defaults to current directory)
  --test-runner <jest|vitest>         Optional test runner override (default: vue/nuxt=vitest, others=jest)
  --pm <pnpm|npm|yarn|auto>           Package manager (auto-detected if omitted)
  --force                             Overwrite existing config files
  --dry-run                           Print planned changes without writing files
  --skip-husky-install                Do not run husky install
  --skills                            Update CLAUDE.md/AGENTS.md/GEMINI.md with feature skill guidance (default: enabled)
  --no-skills                         Disable CLAUDE.md/AGENTS.md/GEMINI.md skill guidance updates
  -h, --help                          Show help
`

interface RawParsedOptions {
  command: string
  projectDir: string | null
  framework: string | null
  features: string[]
  testRunner: string | null
  pm: string | null
  force: boolean
  dryRun: boolean
  skipHuskyInstall: boolean
  skills: boolean
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

function isPackageManagerOption(value: string): value is PackageManagerOption {
  return includes(ALLOWED_PACKAGE_MANAGERS, value)
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

export function parseArgs(argv: string[]): ParsedOptions {
  const options: RawParsedOptions = {
    command: "init",
    projectDir: null,
    framework: null,
    features: [],
    testRunner: null,
    pm: null,
    force: false,
    dryRun: false,
    skipHuskyInstall: false,
    skills: true,
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
    } else if (arg === "--framework") {
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
    } else if (arg === "--test-runner") {
      options.testRunner = readFlagValue(argv, i, "--test-runner")
      i += 1
    } else if (arg.startsWith("--test-runner=")) {
      options.testRunner = readInlineFlagValue(arg, "--test-runner")
    } else if (arg === "--pm") {
      options.pm = readFlagValue(argv, i, "--pm")
      i += 1
    } else if (arg.startsWith("--pm=")) {
      options.pm = readInlineFlagValue(arg, "--pm")
    } else if (arg === "--force") {
      options.force = true
    } else if (arg === "--dry-run") {
      options.dryRun = true
    } else if (arg === "--skip-husky-install") {
      options.skipHuskyInstall = true
    } else if (arg === "--skills") {
      options.skills = true
    } else if (arg === "--no-skills") {
      options.skills = false
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

  if (options.pm && !isPackageManagerOption(options.pm)) {
    throw new Error(`Unsupported package manager: ${options.pm}`)
  }

  if (options.framework && !isFrameworkId(options.framework)) {
    throw new Error(`Unsupported framework: ${options.framework}`)
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
  console.log("Test runners: jest, vitest")
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
