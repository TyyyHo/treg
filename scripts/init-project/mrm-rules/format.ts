import { lines, packageJson } from "../mrm-core.ts"
import { installPackages, withProjectCwd, writeFile } from "./shared.ts"
import type { RuleContext } from "../types.ts"
import {
  FORMAT_IGNORE,
  getFormatterFiles,
  getFormatterScripts,
} from "./format-options.ts"

export async function runFormatRule(context: RuleContext): Promise<void> {
  const { projectDir, pm, force, dryRun, formatter } = context
  const { format, formatCheck } = getFormatterScripts(formatter)
  const { configPath, configContent, ignorePath } = getFormatterFiles(formatter)

  installPackages(projectDir, pm, [formatter], true, dryRun)

  await writeFile(projectDir, configPath, configContent, force, dryRun)

  withProjectCwd(projectDir, () => {
    if (dryRun) {
      if (ignorePath) {
        console.log(`[dry-run] Would update ${ignorePath}`)
      }
      console.log(
        `[dry-run] Would set package scripts: format (${format}), format:check (${formatCheck})`
      )
      return
    }

    if (ignorePath) {
      lines(ignorePath).add(FORMAT_IGNORE).save()
    }
    packageJson()
      .setScript("format", format)
      .setScript("format:check", formatCheck)
      .save()
  })
}
