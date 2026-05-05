import { execSync } from "node:child_process"
import { existsSync } from "node:fs"
import { readFileSync } from "node:fs"
import path from "node:path"
import type { PackageJson, PackageManager } from "./types.ts"

export function detectPackageManager(projectDir: string): PackageManager {
  if (existsSync(path.join(projectDir, "pnpm-lock.yaml"))) {
    return "pnpm"
  }
  if (
    existsSync(path.join(projectDir, "bun.lockb")) ||
    existsSync(path.join(projectDir, "bun.lock"))
  ) {
    return "bun"
  }
  if (existsSync(path.join(projectDir, "yarn.lock"))) {
    return "yarn"
  }
  if (existsSync(path.join(projectDir, "package-lock.json"))) {
    return "npm"
  }
  return "npm"
}

export function getRunCommand(pm: PackageManager): string {
  if (pm === "pnpm") return "pnpm"
  if (pm === "bun") return "bun run"
  if (pm === "yarn") return "yarn"
  return "npm run"
}

export function runCommand(command: string, cwd: string, dryRun = false): void {
  if (dryRun) {
    console.log(`[dry-run] Would run: ${command}`)
    return
  }
  execSync(command, { cwd, stdio: "inherit" })
}

export function runScript(
  pm: PackageManager,
  scriptName: string,
  cwd: string,
  dryRun = false
): void {
  if (pm === "pnpm") {
    runCommand(`pnpm ${scriptName}`, cwd, dryRun)
    return
  }
  if (pm === "bun") {
    runCommand(`bun run ${scriptName}`, cwd, dryRun)
    return
  }
  if (pm === "yarn") {
    runCommand(`yarn ${scriptName}`, cwd, dryRun)
    return
  }
  runCommand(`npm run ${scriptName}`, cwd, dryRun)
}

export function installPackages(
  pm: PackageManager,
  projectDir: string,
  packages: string[],
  isDev: boolean,
  dryRun = false
): void {
  if (packages.length === 0) return

  const list = packages.join(" ")
  let command = ""

  if (pm === "pnpm") {
    assertPnpmStoreCompatible(projectDir, dryRun)
    command = `pnpm add ${isDev ? "-D " : ""}${list}`
  } else if (pm === "bun") {
    command = `bun add ${isDev ? "-d " : ""}${list}`
  } else if (pm === "yarn") {
    command = `yarn add ${isDev ? "-D " : ""}${list}`
  } else {
    const useLegacyPeerDeps = shouldUseNpmLegacyPeerDeps(projectDir)
    if (useLegacyPeerDeps) {
      console.log(
        `${dryRun ? "[dry-run] " : ""}Detected react-scripts with TypeScript >= 5; using --legacy-peer-deps for npm compatibility`
      )
    }
    command = `npm install ${isDev ? "-D " : ""}${list}${useLegacyPeerDeps ? " --legacy-peer-deps" : ""}`
  }

  console.log(
    `${dryRun ? "[dry-run] " : ""}Installing ${isDev ? "dev " : ""}dependencies: ${packages.join(", ")}`
  )
  runCommand(command, projectDir, dryRun)
}

interface PnpmStoreMismatch {
  currentStoreDir: string
  linkedStoreDir: string
}

function assertPnpmStoreCompatible(projectDir: string, dryRun: boolean): void {
  if (dryRun) return

  const mismatch = getPnpmStoreMismatch(projectDir)
  if (!mismatch) return

  throw new Error(formatPnpmStoreMismatchMessage(mismatch))
}

function getPnpmStoreMismatch(
  projectDir: string,
  currentStoreDir = getCurrentPnpmStoreDir(projectDir)
): PnpmStoreMismatch | null {
  const linkedStoreDir = readPnpmLinkedStoreDir(projectDir)
  if (!linkedStoreDir || !currentStoreDir) return null

  if (isSamePath(linkedStoreDir, currentStoreDir)) return null

  return {
    currentStoreDir,
    linkedStoreDir,
  }
}

function readPnpmLinkedStoreDir(projectDir: string): string | null {
  const modulesYamlPath = path.join(projectDir, "node_modules", ".modules.yaml")
  if (!existsSync(modulesYamlPath)) return null

  try {
    const content = readFileSync(modulesYamlPath, "utf8")
    const match = content.match(/^\s*"?storeDir"?\s*:\s*["']([^"']+)["']/m)
    return match?.[1] ?? null
  } catch {
    return null
  }
}

function getCurrentPnpmStoreDir(projectDir: string): string | null {
  try {
    const storeDir = execSync("pnpm store path", {
      cwd: projectDir,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim()
    return storeDir.length > 0 ? storeDir : null
  } catch {
    return null
  }
}

function isSamePath(left: string, right: string): boolean {
  return path.normalize(left) === path.normalize(right)
}

function formatPnpmStoreMismatchMessage(mismatch: PnpmStoreMismatch): string {
  return [
    "Detected pnpm store mismatch.",
    `node_modules is currently linked from: ${mismatch.linkedStoreDir}`,
    `Current pnpm wants to use: ${mismatch.currentStoreDir}`,
    "This usually happens after switching pnpm major versions.",
    '`pnpm install` or `pnpm install --force` may report "Already up to date" without rebuilding the old node_modules links.',
    "Treg will not remove node_modules automatically.",
    "Fix it manually, then rerun Treg:",
    "  rm -rf node_modules",
    "  pnpm install",
  ].join("\n")
}

function shouldUseNpmLegacyPeerDeps(projectDir: string): boolean {
  const packageJson = readPackageJson(projectDir)
  if (!packageJson) return false

  const reactScriptsVersion = getDeclaredVersion(packageJson, "react-scripts")
  if (!reactScriptsVersion) return false

  const typescriptVersion = getDeclaredVersion(packageJson, "typescript")
  if (!typescriptVersion) return false

  const major = extractMajorVersion(typescriptVersion)
  return major !== null && major >= 5
}

function readPackageJson(projectDir: string): PackageJson | null {
  const packageJsonPath = path.join(projectDir, "package.json")
  if (!existsSync(packageJsonPath)) return null

  try {
    return JSON.parse(readFileSync(packageJsonPath, "utf8")) as PackageJson
  } catch {
    return null
  }
}

function getDeclaredVersion(packageJson: PackageJson, packageName: string): string | null {
  const fromDependencies = packageJson.dependencies?.[packageName]
  if (fromDependencies) return fromDependencies

  const fromDevDependencies = packageJson.devDependencies?.[packageName]
  if (fromDevDependencies) return fromDevDependencies

  const fromPeerDependencies = packageJson.peerDependencies?.[packageName]
  if (fromPeerDependencies) return fromPeerDependencies

  const fromOptionalDependencies = packageJson.optionalDependencies?.[packageName]
  if (fromOptionalDependencies) return fromOptionalDependencies

  return null
}

function extractMajorVersion(rawVersion: string): number | null {
  const match = rawVersion.match(/\d+/)
  if (!match) return null

  const major = Number.parseInt(match[0], 10)
  return Number.isNaN(major) ? null : major
}

export const __testables__ = {
  shouldUseNpmLegacyPeerDeps,
  extractMajorVersion,
  readPnpmLinkedStoreDir,
  getPnpmStoreMismatch,
  formatPnpmStoreMismatchMessage,
}
