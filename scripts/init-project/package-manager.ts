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
}
