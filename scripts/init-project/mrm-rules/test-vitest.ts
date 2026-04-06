import { packageJson } from "../mrm-core.ts"
import { installPackages, withProjectCwd, writeFile } from "./shared.ts"
import type { Framework, RuleContext } from "../types.ts"

function getVitestConfig(framework: Framework): string {
  return `import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    environment: "${framework.testEnvironment}",
    setupFiles: ["./vitest.setup.js"],
  },
})
`
}

function getVitestSetup(framework: Framework): string {
  if (framework.id === "react") {
    return `import "@testing-library/jest-dom/vitest"
`
  }
  return `// Vitest setup
`
}

export async function runTestVitestRule(context: RuleContext): Promise<void> {
  const { framework, projectDir, pm, force, dryRun } = context
  const deps = ["vitest"]
  if (framework.testEnvironment === "jsdom") {
    deps.push("jsdom")
  }
  if (framework.id === "react") {
    deps.push("@testing-library/jest-dom")
    deps.push("@testing-library/react")
  }
  installPackages(projectDir, pm, deps, true, dryRun)

  await writeFile(projectDir, "vitest.config.ts", getVitestConfig(framework), force, dryRun)
  await writeFile(projectDir, "vitest.setup.js", getVitestSetup(framework), force, dryRun)

  withProjectCwd(projectDir, () => {
    if (dryRun) {
      console.log("[dry-run] Would set package scripts: test, test:watch, test:coverage")
      return
    }
    packageJson()
      .setScript("test", "vitest run")
      .setScript("test:watch", "vitest")
      .setScript("test:coverage", "vitest run --coverage")
      .save()
  })
}
