import { existsSync } from "node:fs"
import { promises as fs } from "node:fs"
import path from "node:path"
import {
  parseArgs,
  printSupportedTargets,
  resolveFeatures,
  USAGE,
} from "./cli.ts"
import { resolveFramework } from "./frameworks/index.ts"
import { runFeatureRules } from "./mrm-rules/index.ts"
import { detectPackageManager, runScript } from "./package-manager.ts"
import { formatStep } from "./utils.ts"

const TOTAL_STEPS = 3

export async function main(argv = process.argv.slice(2)) {
  let options
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

  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf8"))
  const pm =
    !options.pm || options.pm === "auto"
      ? detectPackageManager(projectDir)
      : options.pm
  const framework = resolveFramework(
    options.framework,
    options.frameworkVersion,
    packageJson
  )
  if (options.frameworkVersion && framework.id !== "react") {
    console.error(
      `Unsupported --framework-version for framework: ${framework.id}`
    )
    process.exitCode = 1
    return
  }
  const enabledFeatures = resolveFeatures(options)

  const context = {
    ...options,
    projectDir,
    pm,
    framework,
    enabledFeatures,
  }

  console.log(formatStep(1, TOTAL_STEPS, "Resolve plan", options.dryRun))
  console.log(
    `${options.dryRun ? "[dry-run] " : ""}Framework=${framework.id}${framework.variant ? `/${framework.variant}` : ""}, features=${Object.entries(
      enabledFeatures
    )
      .filter(([, enabled]) => enabled)
      .map(([name]) => name)
      .join(", ")}, testRunner=${options.testRunner}`
  )

  console.log(formatStep(2, TOTAL_STEPS, "Run mrm rules", options.dryRun))
  await runFeatureRules(context)

  console.log(formatStep(3, TOTAL_STEPS, "Finalize", options.dryRun))
  if (enabledFeatures.format) {
    runScript(pm, "format", projectDir, options.dryRun)
  }
}
