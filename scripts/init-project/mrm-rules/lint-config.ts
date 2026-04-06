import { existsSync } from "node:fs"
import path from "node:path"
import { writeFile } from "./shared.ts"

export const DEFAULT_ESLINT_CONFIG = `export default [
  {
    ignores: ["node_modules/**", "dist/**", "coverage/**"],
  },
]
`

const ESLINT_CONFIG_FILES = [
  "eslint.config.js",
  "eslint.config.mjs",
  "eslint.config.cjs",
  "eslint.config.ts",
  "eslint.config.mts",
  "eslint.config.cts",
  ".eslintrc",
  ".eslintrc.js",
  ".eslintrc.cjs",
  ".eslintrc.json",
  ".eslintrc.yaml",
  ".eslintrc.yml",
] as const

export function findExistingEslintConfig(projectDir: string): string | null {
  for (const fileName of ESLINT_CONFIG_FILES) {
    if (existsSync(path.join(projectDir, fileName))) {
      return fileName
    }
  }
  return null
}

export async function ensureEslintConfig(projectDir: string, dryRun: boolean): Promise<void> {
  const existing = findExistingEslintConfig(projectDir)
  if (existing) {
    console.log(`Skip eslint config creation (${existing} already exists)`)
    return
  }

  await writeFile(projectDir, "eslint.config.mjs", DEFAULT_ESLINT_CONFIG, false, dryRun)
}
