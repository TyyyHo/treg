import { packageJson } from "../mrm-core.ts"
import { installPackages, withProjectCwd, writeFile } from "./shared.ts"
import type { Framework, RuleContext } from "../types.ts"

function getJestConfig(testEnvironment: Framework["testEnvironment"]): string {
  return `/** @type {import("jest").Config} */
const config = {
  testEnvironment: "${testEnvironment}",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testMatch: ["**/*.test.[jt]s?(x)", "**/*.test.ts"],
}

module.exports = config
`
}

function getSetupFile(frameworkId: Framework["id"]): string {
  if (frameworkId === "react") {
    return `require("@testing-library/jest-dom")

// Jest setup (add custom matchers or globals here)
`
  }
  return `// Jest setup (add custom matchers or globals here)
`
}

export async function runTestJestRule(context: RuleContext): Promise<void> {
  const { framework, projectDir, pm, force, dryRun } = context
  const deps = ["jest"]
  if (framework.testEnvironment === "jsdom") {
    deps.push("jest-environment-jsdom")
  }
  if (framework.id === "react") {
    deps.push("@testing-library/jest-dom")
    deps.push("@testing-library/react")
  }
  installPackages(projectDir, pm, deps, true, dryRun)

  await writeFile(
    projectDir,
    "jest.config.js",
    getJestConfig(framework.testEnvironment),
    force,
    dryRun
  )
  await writeFile(projectDir, "jest.setup.js", getSetupFile(framework.id), force, dryRun)

  withProjectCwd(projectDir, () => {
    if (dryRun) {
      console.log("[dry-run] Would set package scripts: test, test:watch, test:coverage")
      return
    }
    packageJson()
      .setScript("test", "NODE_OPTIONS=--experimental-vm-modules jest --passWithNoTests")
      .setScript("test:watch", "NODE_OPTIONS=--experimental-vm-modules jest --watch")
      .setScript("test:coverage", "NODE_OPTIONS=--experimental-vm-modules jest --coverage")
      .save()
  })
}
