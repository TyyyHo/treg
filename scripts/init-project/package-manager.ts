import { execSync } from "node:child_process"
import { existsSync } from "node:fs"
import path from "node:path"

export function detectPackageManager(projectDir) {
  if (existsSync(path.join(projectDir, "pnpm-lock.yaml"))) {
    return "pnpm"
  }
  if (existsSync(path.join(projectDir, "yarn.lock"))) {
    return "yarn"
  }
  if (existsSync(path.join(projectDir, "package-lock.json"))) {
    return "npm"
  }
  return "npm"
}

export function getRunCommand(pm) {
  if (pm === "pnpm") return "pnpm"
  if (pm === "yarn") return "yarn"
  return "npm run"
}

export function runCommand(command, cwd, dryRun = false) {
  if (dryRun) {
    console.log(`[dry-run] Would run: ${command}`)
    return
  }
  execSync(command, { cwd, stdio: "inherit" })
}

export function runScript(pm, scriptName, cwd, dryRun = false) {
  if (pm === "pnpm") {
    runCommand(`pnpm ${scriptName}`, cwd, dryRun)
    return
  }
  if (pm === "yarn") {
    runCommand(`yarn ${scriptName}`, cwd, dryRun)
    return
  }
  runCommand(`npm run ${scriptName}`, cwd, dryRun)
}

export function installPackages(
  pm,
  projectDir,
  packages,
  isDev,
  dryRun = false
) {
  if (packages.length === 0) return

  const list = packages.join(" ")
  let command = ""

  if (pm === "pnpm") {
    command = `pnpm add ${isDev ? "-D " : ""}${list}`
  } else if (pm === "yarn") {
    command = `yarn add ${isDev ? "-D " : ""}${list}`
  } else {
    command = `npm install ${isDev ? "-D " : ""}${list}`
  }

  console.log(
    `${dryRun ? "[dry-run] " : ""}Installing ${isDev ? "dev " : ""}dependencies: ${packages.join(", ")}`
  )
  runCommand(command, projectDir, dryRun)
}
