#!/usr/bin/env node

import { spawnSync } from "node:child_process"
import { mkdtempSync, rmSync, writeFileSync } from "node:fs"
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

function run(command, args, { captureOutput = false } = {}) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    stdio: captureOutput ? ["ignore", "pipe", "pipe"] : "inherit",
  })

  if (result.status !== 0) {
    if (captureOutput && result.stderr) {
      process.stderr.write(result.stderr)
    }
    throw new Error(`Command failed: ${command} ${args.join(" ")}`)
  }

  return captureOutput ? result.stdout.trim() : ""
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

console.log(`[release] Bumping version with target: ${releaseTarget}`)
run("npm", ["version", releaseTarget])

const version = run("node", ["-p", "require('./package.json').version"], {
  captureOutput: true,
})

console.log("[release] Pushing version commit and tag to origin/main")
run("git", ["push", "origin", "main", "--follow-tags"])

console.log(`[release] Done: pushed commit and tag v${version}`)
