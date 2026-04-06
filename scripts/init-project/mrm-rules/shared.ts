import { existsSync } from "node:fs"
import { promises as fs } from "node:fs"
import { readFileSync } from "node:fs"
import path from "node:path"
import { installPackages as installByPackageManager } from "../package-manager.ts"
import type { PackageJson, PackageManager } from "../types.ts"

export function withProjectCwd<T>(projectDir: string, fn: () => T): T {
  const original = process.cwd()
  process.chdir(projectDir)
  try {
    return fn()
  } finally {
    process.chdir(original)
  }
}

export function getInstallOptions(pm: PackageManager): {
  pnpm?: true
  yarn?: true
} {
  if (pm === "pnpm") return { pnpm: true }
  if (pm === "yarn") return { yarn: true }
  return {}
}

export function installPackages(
  projectDir: string,
  pm: PackageManager,
  packages: string[],
  dev = true,
  dryRun = false
): void {
  const missingPackages = filterUninstalledPackages(projectDir, packages)
  if (missingPackages.length === 0) {
    console.log(`Skip install (already present): ${packages.join(", ")}`)
    return
  }
  if (missingPackages.length !== packages.length) {
    const installedPackages = packages.filter((candidate) => !missingPackages.includes(candidate))
    console.log(`Skip already installed: ${installedPackages.join(", ")}`)
  }
  installByPackageManager(pm, projectDir, missingPackages, dev, dryRun)
}

export function filterUninstalledPackages(projectDir: string, packages: string[]): string[] {
  if (packages.length === 0) return []

  const installed = getInstalledPackageNames(projectDir)
  if (installed.size === 0) return packages

  return packages.filter((pkg) => !installed.has(getPackageName(pkg)))
}

function getInstalledPackageNames(projectDir: string): Set<string> {
  const packageJsonPath = path.join(projectDir, "package.json")
  if (!existsSync(packageJsonPath)) return new Set()

  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8")) as PackageJson
    return new Set<string>([
      ...Object.keys(packageJson.dependencies ?? {}),
      ...Object.keys(packageJson.devDependencies ?? {}),
      ...Object.keys(packageJson.peerDependencies ?? {}),
      ...Object.keys(packageJson.optionalDependencies ?? {}),
    ])
  } catch {
    return new Set()
  }
}

function getPackageName(pkg: string): string {
  if (pkg.startsWith("@")) {
    const scopeEnd = pkg.indexOf("/", 1)
    if (scopeEnd < 0) return pkg
    const versionStart = pkg.indexOf("@", scopeEnd + 1)
    return versionStart < 0 ? pkg : pkg.slice(0, versionStart)
  }

  const versionStart = pkg.indexOf("@")
  return versionStart < 0 ? pkg : pkg.slice(0, versionStart)
}

export async function writeFile(
  projectDir: string,
  relativePath: string,
  content: string,
  force: boolean,
  dryRun: boolean
): Promise<boolean> {
  const targetPath = path.join(projectDir, relativePath)
  try {
    await fs.access(targetPath)
    if (!force) {
      console.log(`Skip ${relativePath} (already exists)`)
      return false
    }
  } catch {
    // File doesn't exist.
  }

  if (dryRun) {
    console.log(`[dry-run] Would ${force ? "update" : "create"} ${relativePath}`)
    return true
  }

  await fs.mkdir(path.dirname(targetPath), { recursive: true })
  await fs.writeFile(targetPath, content, "utf8")
  console.log(`${force ? "Updated" : "Created"} ${relativePath}`)
  return true
}
