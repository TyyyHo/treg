import { lines, packageJson } from "../mrm-core.mjs"
import { installPackages, withProjectCwd, writeFile } from "./shared.mjs"

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

export async function runFormatRule(context) {
  const { projectDir, pm, force, dryRun } = context
  installPackages(projectDir, pm, ["prettier"], true, dryRun)

  await writeFile(
    projectDir,
    ".prettierrc.json",
    PRETTIER_CONFIG,
    force,
    dryRun
  )

  withProjectCwd(projectDir, () => {
    if (dryRun) {
      console.log("[dry-run] Would update .prettierignore")
      console.log("[dry-run] Would set package scripts: format, format:check")
      return
    }
    lines(".prettierignore").add(PRETTIER_IGNORE).save()
    packageJson()
      .setScript("format", "prettier --write .")
      .setScript("format:check", "prettier --check .")
      .save()
  })
}
