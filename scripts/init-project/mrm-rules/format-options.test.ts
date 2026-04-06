import { describe, expect, it } from "@jest/globals"
import { FORMAT_IGNORE, getFormatterFiles, getFormatterScripts } from "./format-options.ts"

const EXPECTED_OXFMT_CONFIG = {
  $schema: "./node_modules/oxfmt/configuration_schema.json",
  semi: false,
  trailingComma: "es5",
  lineWidth: 80,
  indentWidth: 2,
  useTabs: false,
  quotes: "double",
  ignorePatterns: FORMAT_IGNORE,
}

const EXPECTED_PRETTIER_CONFIG = {
  semi: false,
  trailingComma: "es5",
  singleQuote: false,
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  arrowParens: "avoid",
  endOfLine: "lf",
}

describe("format options", () => {
  it("returns oxfmt config and scripts", () => {
    const files = getFormatterFiles("oxfmt")
    const scripts = getFormatterScripts("oxfmt")

    expect(files.configPath).toBe(".oxfmtrc.json")
    expect(files.ignorePath).toBeNull()
    expect(JSON.parse(files.configContent)).toEqual(EXPECTED_OXFMT_CONFIG)
    expect(scripts.format).toBe("oxfmt .")
    expect(scripts.formatCheck).toBe("oxfmt . --check")
  })

  it("returns prettier config and scripts", () => {
    const files = getFormatterFiles("prettier")
    const scripts = getFormatterScripts("prettier")

    expect(files.configPath).toBe(".prettierrc.json")
    expect(files.ignorePath).toBe(".prettierignore")
    expect(JSON.parse(files.configContent)).toEqual(EXPECTED_PRETTIER_CONFIG)
    expect(scripts.format).toBe("prettier --write .")
    expect(scripts.formatCheck).toBe("prettier --check .")
  })

  it("uses shared ignore patterns for all formatters", () => {
    expect(FORMAT_IGNORE).toContain("node_modules")
    expect(FORMAT_IGNORE).toContain(".agents")
    expect(FORMAT_IGNORE).toContain(".claude")
    expect(FORMAT_IGNORE).toContain("dist")
    expect(FORMAT_IGNORE).toContain("pnpm-lock.yaml")
  })
})
