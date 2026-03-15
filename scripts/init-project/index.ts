import { existsSync } from "node:fs"
import { promises as fs } from "node:fs"
import path from "node:path"
import {
  parseArgs,
  printSupportedTargets,
  resolveFeatures,
  resolveTestRunner,
  USAGE,
} from "./cli.ts"
import { resolveFramework } from "./frameworks/index.ts"
import { runFeatureRules } from "./mrm-rules/index.ts"
import { detectPackageManager, runScript } from "./package-manager.ts"
import { formatStep } from "./utils.ts"
import type { PackageJson, ParsedOptions, RuleContext } from "./types.ts"

const TOTAL_STEPS = 3

export async function main(
  argv: string[] = process.argv.slice(2)
): Promise<void> {
  let options: ParsedOptions
  try {
    options = parseArgs(argv)
  } catch (error) {
    console.error(error.message ?? error)
    console.log(USAGE)
    process.exitCode = 1
    return
  }

  if (options.help) {
    console.log(USAGE)
    return
  }
  if (options.command === "list") {
    printSupportedTargets()
    return
  }

  const projectDir = path.resolve(options.projectDir ?? process.cwd())
  const packageJsonPath = path.join(projectDir, "package.json")
  if (!existsSync(packageJsonPath)) {
    console.error(`package.json not found in ${projectDir}`)
    process.exitCode = 1
    return
  }

  const packageJson = JSON.parse(
    await fs.readFile(packageJsonPath, "utf8")
  ) as PackageJson
  const pm =
    !options.pm || options.pm === "auto"
      ? detectPackageManager(projectDir)
      : options.pm
  const framework = resolveFramework(options.framework, packageJson)
  const testRunner = resolveTestRunner(framework.id, options.testRunner)
  const enabledFeatures = resolveFeatures(options)

  const context: RuleContext = {
    ...options,
    testRunner,
    projectDir,
    pm,
    framework,
    enabledFeatures,
  }

  console.log(formatStep(1, TOTAL_STEPS, "Resolve plan", options.dryRun))
  console.log(
    `${options.dryRun ? "[dry-run] " : ""}Framework=${framework.id}, features=${Object.entries(
      enabledFeatures
    )
      .filter(([, enabled]) => enabled)
      .map(([name]) => name)
      .join(", ")}, formatter=${options.formatter}, testRunner=${testRunner}`
  )

  console.log(formatStep(2, TOTAL_STEPS, "Run mrm rules", options.dryRun))
  await runFeatureRules(context)

  console.log(formatStep(3, TOTAL_STEPS, "Finalize", options.dryRun))
  if (enabledFeatures.format) {
    runScript(pm, "format", projectDir, options.dryRun)
  }
}
