import { describe, expect, it } from "@jest/globals"
import { parseArgs, resolveFeatures, resolveTestRunner } from "./cli.ts"

describe("parseArgs", () => {
  it("parses add command options", () => {
    const parsed = parseArgs([
      "add",
      "--dir",
      "demo-app",
      "--framework",
      "react",
      "--formatter",
      "oxfmt",
      "--features",
      "lint,test",
      "--test-runner",
      "vitest",
      "--force",
      "--dry-run",
      "--skip-husky-install",
    ])

    expect(parsed).toEqual({
      command: "add",
      projectDir: "demo-app",
      framework: "react",
      formatter: "oxfmt",
      features: ["lint", "test"],
      testRunner: "vitest",
      force: true,
      dryRun: true,
      skipHuskyInstall: true,
      aiRules: true,
      aiTools: ["claude", "codex", "gemini"],
      help: false,
    })
  })

  it("parses init with only dry-run", () => {
    const parsed = parseArgs(["init", "--dry-run"])
    expect(parsed.command).toBe("init")
    expect(parsed.dryRun).toBe(true)
    expect(parsed.features).toEqual([])
  })

  it("parses list command", () => {
    const parsed = parseArgs(["list"])
    expect(parsed.command).toBe("list")
    expect(parsed.formatter).toBe("prettier")
    expect(parsed.aiTools).toEqual(["claude", "codex", "gemini"])
  })

  it("allows init without options", () => {
    const parsed = parseArgs(["init"])
    expect(parsed.framework).toBeNull()
    expect(parsed.formatter).toBe("prettier")
    expect(parsed.testRunner).toBeNull()
  })

  it("accepts oxfmt formatter override for add", () => {
    const parsed = parseArgs(["add", "--formatter", "oxfmt"])
    expect(parsed.formatter).toBe("oxfmt")
  })

  it("throws for unsupported framework", () => {
    expect(() => parseArgs(["add", "--framework", "angular"])).toThrow(
      "Unsupported framework: angular"
    )
  })

  it("throws for unsupported formatter", () => {
    expect(() => parseArgs(["add", "--formatter", "biome"])).toThrow("Unsupported formatter: biome")
  })

  it("throws for positional dir argument", () => {
    expect(() => parseArgs(["add", "."])).toThrow("Unknown argument: .")
  })

  it("throws for unsupported feature", () => {
    expect(() => parseArgs(["add", "--framework", "node", "--features", "husky,ai"])).toThrow(
      "Unsupported feature in --features: ai"
    )
  })

  it("throws when init receives removed flags", () => {
    expect(() => parseArgs(["init", "--framework", "react"])).toThrow(
      "Unsupported option for init: --framework"
    )
  })

  it("throws when add receives removed pm flag", () => {
    expect(() => parseArgs(["add", "--pm", "npm"])).toThrow("Unknown argument: --pm")
  })

  it("throws for removed no flags", () => {
    expect(() => parseArgs(["add", "--no-format"])).toThrow("Unknown argument: --no-format")
    expect(() => parseArgs(["add", "--no-test-runner"])).toThrow(
      "Unknown argument: --no-test-runner"
    )
  })
})

describe("resolveFeatures", () => {
  it("enables all features by default", () => {
    expect(resolveFeatures(parseArgs(["add"]))).toEqual({
      lint: true,
      format: true,
      typescript: true,
      test: true,
      husky: true,
    })
  })

  it("uses selected features", () => {
    expect(resolveFeatures(parseArgs(["add", "--features", "lint,format,husky"]))).toEqual({
      lint: true,
      format: true,
      typescript: false,
      test: false,
      husky: true,
    })
  })
})

describe("resolveTestRunner", () => {
  it("defaults vue and nuxt to vitest", () => {
    expect(resolveTestRunner("vue", null)).toBe("vitest")
    expect(resolveTestRunner("nuxt", null)).toBe("vitest")
  })

  it("defaults other frameworks to jest", () => {
    expect(resolveTestRunner("node", null)).toBe("jest")
    expect(resolveTestRunner("react", null)).toBe("jest")
    expect(resolveTestRunner("next", null)).toBe("jest")
    expect(resolveTestRunner("svelte", null)).toBe("jest")
  })

  it("allows each framework to override with --test-runner", () => {
    const frameworks = ["node", "react", "next", "vue", "svelte", "nuxt"] as const
    for (const framework of frameworks) {
      expect(resolveTestRunner(framework, "jest")).toBe("jest")
      expect(resolveTestRunner(framework, "vitest")).toBe("vitest")
    }
  })
})
