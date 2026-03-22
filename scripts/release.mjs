#!/usr/bin/env node

import { mkdtempSync, rmSync, writeFileSync } from "node:fs"

import path from "node:path"
import { spawnSync } from "node:child_process"
import { tmpdir } from "node:os"

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
const EXPECTED_PACKAGE_NAME = "@tylercore/treg"
const NPM_ENV_KEYS_TO_STRIP = new Set([
  "npm_config_npm_globalconfig",
  "npm_config_verify_deps_before_run",
  "npm_config__jsr_registry",
  "NPM_CONFIG_NPM_GLOBALCONFIG",
  "NPM_CONFIG_VERIFY_DEPS_BEFORE_RUN",
  "NPM_CONFIG__JSR_REGISTRY",
])

function sanitizeEnvForNpm(env) {
  const nextEnv = { ...env }
  for (const key of NPM_ENV_KEYS_TO_STRIP) {
    delete nextEnv[key]
  }
  return nextEnv
}

function run(command, args, { captureOutput = false, cwd, env } = {}) {
  const mergedEnv = {
    ...process.env,
    ...env,
  }
  const childEnv = command === "npm" ? sanitizeEnvForNpm(mergedEnv) : mergedEnv

  const result = spawnSync(command, args, {
    cwd,
    env: childEnv,
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

function ensurePackageName() {
  const packageName = run("node", ["-p", "require('./package.json').name"], {
    captureOutput: true,
  })
  if (packageName !== EXPECTED_PACKAGE_NAME) {
    fail(
      `package.json name must be ${EXPECTED_PACKAGE_NAME} for release. Current name: ${packageName}`
    )
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
    const distCliPath = path.resolve("dist/init-project.js")
    run("node", [distCliPath, "init", "--dry-run"], {
      cwd: smokeDir,
      // Run smoke test non-interactively, so init uses defaults instead of prompts.
      captureOutput: true,
    })
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
ensurePackageName()
ensureCleanWorkingTree()
runCiValidation()
ensureCleanWorkingTree()

console.log(`[release] Bumping version with target: ${releaseTarget}`)
run("npm", ["version", releaseTarget, "-m", "chore: release v%s"])

const version = run("node", ["-p", "require('./package.json').version"], {
  captureOutput: true,
})

console.log("[release] Pushing version commit and tag to origin/main")
run("git", ["push", "origin", "main", "--follow-tags"], {
  // CI validation already ran in this script; avoid duplicate checks in pre-push hook.
  env: { HUSKY: "0" },
})

console.log(`[release] Done: pushed commit and tag v${version}`)
