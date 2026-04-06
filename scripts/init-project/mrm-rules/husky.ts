import { promises as fs } from "node:fs"
import path from "node:path"
import { packageJson } from "../mrm-core.ts"
import { existsSync } from "node:fs"
import { getRunCommand, runCommand } from "../package-manager.ts"
import { installPackages, withProjectCwd, writeFile } from "./shared.ts"
import type { EnabledFeatures, PackageManager, RuleContext } from "../types.ts"

function buildHookCommands(
  runner: ReturnType<typeof getRunCommand>,
  enabledFeatures: EnabledFeatures
): { preCommit: string[]; prePush: string[] } {
  const preCommit = [`${runner} format:check || exit 1`, `${runner} lint:check || exit 1`]
  if (enabledFeatures.typescript) {
    preCommit.push(`${runner} type:check || exit 1`)
  }

  const prePush = [...preCommit]
  if (enabledFeatures.test) {
    prePush.push(`${runner} test || exit 1`)
  }

  return { preCommit, prePush }
}

export async function runHuskyRule(context: RuleContext): Promise<void> {
  const { projectDir, pm, force, dryRun, skipHuskyInstall, enabledFeatures } = context

  installPackages(projectDir, pm, ["husky"], true, dryRun)
  const runner = getRunCommand(pm)
  const { preCommit, prePush } = buildHookCommands(runner, enabledFeatures)

  await writeFile(
    projectDir,
    ".husky/pre-commit",
    `# Husky pre-commit\n${preCommit.join("\n")}\n`,
    force,
    dryRun
  )
  await writeFile(
    projectDir,
    ".husky/pre-push",
    `# Husky pre-push\n${prePush.join("\n")}\n`,
    force,
    dryRun
  )

  if (!dryRun) {
    await fs.chmod(path.join(projectDir, ".husky/pre-commit"), 0o755)
    await fs.chmod(path.join(projectDir, ".husky/pre-push"), 0o755)
  }

  withProjectCwd(projectDir, () => {
    if (dryRun) {
      console.log("[dry-run] Would set package script: prepare")
      return
    }
    packageJson().setScript("prepare", "husky").save()
  })

  if (skipHuskyInstall) {
    console.log("Skip husky install (--skip-husky-install)")
    return
  }
  if (!existsSync(path.join(projectDir, ".git"))) {
    console.log("Skip husky install (.git not found)")
    return
  }
  if (!dryRun) {
    runHuskyInstallCommand(pm, projectDir)
  }
}

function runHuskyInstallCommand(pm: PackageManager, projectDir: string): void {
  if (pm === "pnpm") {
    runCommand("pnpm exec husky", projectDir, false)
    return
  }
  if (pm === "bun") {
    runCommand("bunx husky", projectDir, false)
    return
  }
  if (pm === "yarn") {
    runCommand("yarn husky", projectDir, false)
    return
  }
  runCommand("npx husky", projectDir, false)
}
