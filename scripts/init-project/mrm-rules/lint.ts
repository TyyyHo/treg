import { packageJson } from "../mrm-core.ts"
import { installPackages, withProjectCwd } from "./shared.ts"

export async function runLintRule(context) {
  const { projectDir, pm, dryRun } = context
  installPackages(projectDir, pm, ["eslint"], true, dryRun)

  withProjectCwd(projectDir, () => {
    if (dryRun) {
      console.log("[dry-run] Would set package scripts: lint, lint:check")
      return
    }
    packageJson()
      .setScript("lint", "eslint .")
      .setScript("lint:check", "eslint . --max-warnings 0")
      .save()
  })
}
