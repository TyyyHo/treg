import { getSelectedPackagePresets } from "../frameworks/packages.ts"
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { installPackages, writeFile } from "./shared.ts"
import type { PackagePreset, RuleContext } from "../types.ts"

export function buildPackageInstallPlan(presets: readonly PackagePreset[]): {
  dependencies: string[]
  devDependencies: string[]
} {
  return {
    dependencies: [...new Set(presets.flatMap((preset) => preset.dependencies ?? []))],
    devDependencies: [...new Set(presets.flatMap((preset) => preset.devDependencies ?? []))],
  }
}

export async function runPackagesRule(context: RuleContext): Promise<void> {
  const { framework, projectDir, pm, dryRun, force, selectedPackageIds } = context
  const presets = getSelectedPackagePresets(framework.id, selectedPackageIds)
  if (presets.length === 0) {
    return
  }

  const { dependencies, devDependencies } = buildPackageInstallPlan(presets)
  installPackages(projectDir, pm, dependencies, false, dryRun)
  installPackages(projectDir, pm, devDependencies, true, dryRun)

  if (selectedPackageIds.includes("tailwind")) {
    await ensureCnHelper(projectDir, force, dryRun)
  }
}

function resolveLibDir(projectDir: string): "app/lib" | "lib" {
  if (existsSync(path.join(projectDir, "lib"))) {
    return "lib"
  }
  if (existsSync(path.join(projectDir, "app", "lib"))) {
    return "app/lib"
  }
  return "lib"
}

function hasTypeScript(projectDir: string): boolean {
  if (existsSync(path.join(projectDir, "tsconfig.json"))) {
    return true
  }

  const packageJsonPath = path.join(projectDir, "package.json")
  if (!existsSync(packageJsonPath)) {
    return false
  }

  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8")) as {
      dependencies?: Record<string, string>
      devDependencies?: Record<string, string>
    }
    return Boolean(packageJson.dependencies?.typescript || packageJson.devDependencies?.typescript)
  } catch {
    return false
  }
}

function getCnHelperContent(projectDir: string): string {
  if (hasTypeScript(projectDir)) {
    return `import { clsx, type ClassValue } from "clsx"

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}
`
  }

  return `import { clsx } from "clsx"

export function cn(...inputs) {
  return clsx(inputs)
}
`
}

async function ensureCnHelper(projectDir: string, force: boolean, dryRun: boolean): Promise<void> {
  const libDir = resolveLibDir(projectDir)
  const extension = hasTypeScript(projectDir) ? "ts" : "js"
  await writeFile(
    projectDir,
    `${libDir}/cn.${extension}`,
    getCnHelperContent(projectDir),
    force,
    dryRun
  )
}

export const __testables__ = {
  ensureCnHelper,
  getCnHelperContent,
  hasTypeScript,
  resolveLibDir,
}
