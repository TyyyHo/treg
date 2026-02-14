const ALLOWED_COMMANDS = ["init", "add", "list"]
const ALLOWED_PACKAGE_MANAGERS = ["pnpm", "npm", "yarn", "auto"]
const ALLOWED_FRAMEWORKS = ["node", "react", "next", "vue", "svelte", "nuxt"]
const ALLOWED_FEATURES = ["lint", "format", "typescript", "test", "husky"]
const ALLOWED_TEST_RUNNERS = ["jest", "vitest"]

export const USAGE = `Usage: frontend-rules <command> [projectDir] [options]

Commands:
  init                                Initialize infra rules in a project (requires --framework)
  add                                 Add selected infra features to an existing project
  list                                List supported frameworks, features, and test runners

Options:
  --framework <node|react|next|vue|svelte|nuxt>
                                      Target framework
  --framework-version <major>         Optional framework major version hint
  --features <lint,format,typescript,test,husky>
                                      Features to install (all selected by default)
  --test-runner <jest|vitest>         Test runner when test feature is enabled
  --pm <pnpm|npm|yarn|auto>           Package manager (auto-detected if omitted)
  --force                             Overwrite existing config files
  --dry-run                           Print planned changes without writing files
  --skip-husky-install                Do not run husky install
  --skills                            Update AGENTS.md/CLAUDE.md with feature skill guidance
  -h, --help                          Show help
`

export function parseArgs(argv) {
  const options = {
    command: "init",
    projectDir: null,
    framework: null,
    frameworkVersion: null,
    features: [],
    testRunner: "jest",
    pm: null,
    force: false,
    dryRun: false,
    skipHuskyInstall: false,
    skills: false,
    help: false,
  }

  let cursor = 0
  const firstArg = argv[0]
  if (firstArg && ALLOWED_COMMANDS.includes(firstArg)) {
    options.command = firstArg
    cursor = 1
  }

  for (let i = cursor; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === "-h" || arg === "--help") {
      options.help = true
    } else if (arg === "--framework") {
      options.framework = argv[i + 1]
      i += 1
    } else if (arg.startsWith("--framework=")) {
      options.framework = arg.split("=")[1]
    } else if (arg === "--framework-version") {
      options.frameworkVersion = argv[i + 1]
      i += 1
    } else if (arg.startsWith("--framework-version=")) {
      options.frameworkVersion = arg.split("=")[1]
    } else if (arg === "--features") {
      options.features.push(...parseCsvValue(argv[i + 1], "--features"))
      i += 1
    } else if (arg.startsWith("--features=")) {
      options.features.push(...parseCsvValue(arg.split("=")[1], "--features"))
    } else if (arg === "--test-runner") {
      options.testRunner = argv[i + 1]
      i += 1
    } else if (arg.startsWith("--test-runner=")) {
      options.testRunner = arg.split("=")[1]
    } else if (arg === "--pm") {
      options.pm = argv[i + 1]
      i += 1
    } else if (arg.startsWith("--pm=")) {
      options.pm = arg.split("=")[1]
    } else if (arg === "--force") {
      options.force = true
    } else if (arg === "--dry-run") {
      options.dryRun = true
    } else if (arg === "--skip-husky-install") {
      options.skipHuskyInstall = true
    } else if (arg === "--skills") {
      options.skills = true
    } else if (!arg.startsWith("-") && !options.projectDir) {
      options.projectDir = arg
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }

  validateParsedOptions(options)
  return options
}

function parseCsvValue(rawValue, flagName) {
  if (!rawValue) {
    throw new Error(`Missing value for ${flagName}`)
  }

  return rawValue
    .split(",")
    .map(item => item.trim())
    .filter(Boolean)
}

function validateParsedOptions(options) {
  if (!ALLOWED_COMMANDS.includes(options.command)) {
    throw new Error(`Unsupported command: ${options.command}`)
  }

  if (options.pm && !ALLOWED_PACKAGE_MANAGERS.includes(options.pm)) {
    throw new Error(`Unsupported package manager: ${options.pm}`)
  }

  if (options.framework && !ALLOWED_FRAMEWORKS.includes(options.framework)) {
    throw new Error(`Unsupported framework: ${options.framework}`)
  }

  if (options.frameworkVersion && !/^\d+$/.test(options.frameworkVersion)) {
    throw new Error(
      "Invalid --framework-version: major version must be numeric"
    )
  }

  if (!ALLOWED_TEST_RUNNERS.includes(options.testRunner)) {
    throw new Error(`Unsupported test runner: ${options.testRunner}`)
  }

  for (const feature of options.features) {
    if (!ALLOWED_FEATURES.includes(feature)) {
      throw new Error(`Unsupported feature in --features: ${feature}`)
    }
  }

  if (options.command === "init" && !options.help && !options.framework) {
    throw new Error("Missing required option: --framework")
  }
}

export function resolveFeatures(options) {
  const selected = new Set(
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
