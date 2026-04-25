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
import { collectAddPrompts, collectInitPrompts } from "./init-prompts.ts"
import { runFeatureRules } from "./mrm-rules/index.ts"
import { detectPackageManager, runScript } from "./package-manager.ts"
import { formatStep } from "./utils.ts"
import type { PackageJson, ParsedOptions, RuleContext } from "./types.ts"

const TOTAL_STEPS = 3

export async function main(argv: string[] = process.argv.slice(2)): Promise<void> {
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

  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf8")) as PackageJson
  const framework = resolveFramework(options.framework, packageJson)
  let pm = detectPackageManager(projectDir)
  let formatter = options.formatter
  let testRunner = resolveTestRunner(framework.id, options.testRunner)
  let enabledFeatures = resolveFeatures(options)
  let aiRules = options.aiRules
  let aiTools = [...options.aiTools]

  if (options.command === "init") {
    const prompted = await collectInitPrompts({
      pm,
      formatter,
      testRunner: resolveTestRunner(framework.id, null),
    })
    pm = prompted.pm
    formatter = prompted.formatter
    testRunner = prompted.testRunner
    enabledFeatures = prompted.enabledFeatures
    aiRules = prompted.aiRules
    aiTools = prompted.aiTools
  }

  if (options.command === "add" && options.features.length === 0) {
    const prompted = await collectAddPrompts({
      projectDir,
      formatter,
      testRunner,
    })
    formatter = prompted.formatter
    testRunner = prompted.testRunner
    enabledFeatures = prompted.enabledFeatures
    aiRules = prompted.aiRules
    aiTools = prompted.aiTools
  }

  const context: RuleContext = {
    ...options,
    formatter,
    testRunner,
    projectDir,
    pm,
    framework,
    enabledFeatures,
    aiRules,
    aiTools,
  }

  console.log(formatStep(1, TOTAL_STEPS, "Resolve plan", options.dryRun))
  console.log(
    `${options.dryRun ? "[dry-run] " : ""}Framework=${framework.id}, pm=${pm}, features=${Object.entries(
      enabledFeatures
    )
      .filter(([, enabled]) => enabled)
      .map(([name]) => name)
      .join(
        ", "
      )}, formatter=${formatter}, testRunner=${testRunner}, aiTools=${aiRules ? aiTools.join(", ") : "disabled"}`
  )

  console.log(formatStep(2, TOTAL_STEPS, "Run mrm rules", options.dryRun))
  await runFeatureRules(context)

  console.log(formatStep(3, TOTAL_STEPS, "Finalize", options.dryRun))
  if (enabledFeatures.format) {
    runScript(pm, "format", projectDir, options.dryRun)
  }
}
