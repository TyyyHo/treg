#!/usr/bin/env node

import { spawnSync } from "node:child_process"
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"

const ALLOWED_TARGETS = new Set([
  "patch",
  "minor",
  "major",
  "prepatch",
  "preminor",
  "premajor",
  "prerelease",
])
const EXACT_SEMVER = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z-.]+)?(?:\+[0-9A-Za-z-.]+)?$/

function run(
  command,
  args,
  { captureOutput = false, cwd = process.cwd() } = {}
) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    stdio: captureOutput ? ["ignore", "pipe", "pipe"] : "inherit",
    cwd,
  })

  if (result.status !== 0) {
    if (captureOutput && result.stderr) {
      process.stderr.write(result.stderr)
    }
    throw new Error(`Command failed: ${command} ${args.join(" ")}`)
  }

  return captureOutput ? result.stdout.trim() : ""
}

function commandStatus(command, args, cwd = process.cwd()) {
  return spawnSync(command, args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    cwd,
  })
}

function fail(message) {
  console.error(`[release] ${message}`)
  process.exit(1)
}

function printUsage() {
  console.log("Usage: pnpm release [patch|minor|major|pre*|x.y.z]")
  console.log("Example: pnpm release")
  console.log("Example: pnpm release minor")
}

function ensureMainBranch() {
  const branch = run("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
    captureOutput: true,
  })
  if (branch !== "main") {
    fail(`Release is only allowed on main. Current branch: ${branch}`)
  }
}

function ensureCleanWorkingTree() {
  const status = run("git", ["status", "--porcelain"], {
    captureOutput: true,
  })
  if (status) {
    fail("Working tree must be clean before release.")
  }
}

function runCiValidation() {
  console.log("[release] Running CI validation steps")
  run("pnpm", ["format:check"])
  run("pnpm", ["lint:check"])
  run("pnpm", ["type:check"])
  run("pnpm", ["test"])
  run("pnpm", ["build"])

  const smokeDir = mkdtempSync(path.join(tmpdir(), "treg-release-ci-"))
  try {
    writeFileSync(
      path.join(smokeDir, "package.json"),
      '{ "name": "release-smoke", "version": "1.0.0" }\n',
      "utf8"
    )
    run("node", [
      "dist/init-project.js",
      "init",
      "--dir",
      smokeDir,
      "--framework",
      "node",
      "--dry-run",
    ])
  } finally {
    rmSync(smokeDir, { recursive: true, force: true })
  }
}

function resolveReleaseVersion(releaseTarget) {
  if (EXACT_SEMVER.test(releaseTarget)) {
    return releaseTarget
  }

  const currentVersion = JSON.parse(
    readFileSync("package.json", "utf8")
  ).version
  const tmpDir = mkdtempSync(path.join(tmpdir(), "treg-release-version-"))

  try {
    writeFileSync(
      path.join(tmpDir, "package.json"),
      JSON.stringify(
        {
          name: "release-version-resolver",
          version: currentVersion,
        },
        null,
        2
      ) + "\n",
      "utf8"
    )
    run("npm", ["version", releaseTarget, "--no-git-tag-version"], {
      cwd: tmpDir,
    })
    return JSON.parse(readFileSync(path.join(tmpDir, "package.json"), "utf8"))
      .version
  } finally {
    rmSync(tmpDir, { recursive: true, force: true })
  }
}

function ensureTagNotExists(tagName) {
  const local = commandStatus("git", [
    "rev-parse",
    "-q",
    "--verify",
    `refs/tags/${tagName}`,
  ])
  if (local.status === 0) {
    fail(`Tag already exists locally: ${tagName}`)
  }

  const remote = commandStatus("git", [
    "ls-remote",
    "--exit-code",
    "--tags",
    "origin",
    `refs/tags/${tagName}`,
  ])
  if (remote.status === 0) {
    fail(`Tag already exists on origin: ${tagName}`)
  }
  if (remote.status !== 2) {
    if (remote.stderr) {
      process.stderr.write(remote.stderr)
    }
    fail("Unable to verify remote tags on origin.")
  }
}

const input = process.argv[2]
if (input === "--help" || input === "-h") {
  printUsage()
  process.exit(0)
}

const releaseTarget = input ?? "patch"
if (!ALLOWED_TARGETS.has(releaseTarget) && !EXACT_SEMVER.test(releaseTarget)) {
  printUsage()
  fail(`Invalid release target: ${releaseTarget}`)
}

ensureMainBranch()
ensureCleanWorkingTree()
runCiValidation()
ensureCleanWorkingTree()

const version = resolveReleaseVersion(releaseTarget)
const tagName = `v${version}`

ensureTagNotExists(tagName)

console.log(`[release] Creating release tag ${tagName}`)
run("git", ["tag", tagName])

console.log(`[release] Pushing tag ${tagName} to origin`)
run("git", ["push", "origin", tagName])

console.log(
  `[release] Done: pushed tag ${tagName}. package.json version will be synced during publish workflow.`
)
