import { lines, packageJson } from "../mrm-core.ts"
import { installPackages, withProjectCwd, writeFile } from "./shared.ts"
import type { Formatter, RuleContext } from "../types.ts"

const PRETTIER_CONFIG = `{
  "semi": false,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
`

const PRETTIER_IGNORE = [
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
  "*.log",
  ".env*",
  ".vercel",
  "pnpm-lock.yaml",
  "package-lock.json",
  "yarn.lock",
]

function getFormatterScripts(formatter: Formatter): {
  format: string
  formatCheck: string
} {
  if (formatter === "oxfmt") {
    return {
      format: "oxfmt --write .",
      formatCheck: "oxfmt --check .",
    }
  }
  return {
    format: "prettier --write .",
    formatCheck: "prettier --check .",
  }
}

export async function runFormatRule(context: RuleContext): Promise<void> {
  const { projectDir, pm, force, dryRun, formatter } = context
  const { format, formatCheck } = getFormatterScripts(formatter)

  installPackages(projectDir, pm, [formatter], true, dryRun)

  if (formatter === "prettier") {
    await writeFile(
      projectDir,
      ".prettierrc.json",
      PRETTIER_CONFIG,
      force,
      dryRun
    )
  }

  withProjectCwd(projectDir, () => {
    if (dryRun) {
      console.log("[dry-run] Would update .prettierignore")
      console.log(
        `[dry-run] Would set package scripts: format (${format}), format:check (${formatCheck})`
      )
      return
    }
    lines(".prettierignore").add(PRETTIER_IGNORE).save()
    packageJson()
      .setScript("format", format)
      .setScript("format:check", formatCheck)
      .save()
  })
}
