import { describe, expect, it } from "@jest/globals"
import { parseArgs, resolveFeatures, resolveTestRunner } from "./cli.ts"

describe("parseArgs", () => {
  it("parses init command options", () => {
    const parsed = parseArgs([
      "init",
      "--dir",
      "demo-app",
      "--framework",
      "react",
      "--features",
      "lint,test",
      "--test-runner",
      "vitest",
      "--pm=npm",
      "--force",
      "--dry-run",
      "--skip-husky-install",
    ])

    expect(parsed).toEqual({
      command: "init",
      projectDir: "demo-app",
      framework: "react",
      features: ["lint", "test"],
      testRunner: "vitest",
      pm: "npm",
      force: true,
      dryRun: true,
      skipHuskyInstall: true,
      skills: true,
      help: false,
    })
  })

  it("parses list command", () => {
    const parsed = parseArgs(["list"])
    expect(parsed.command).toBe("list")
  })

  it("accepts additional frameworks", () => {
    const parsed = parseArgs(["init", "--framework", "nuxt"])
    expect(parsed.framework).toBe("nuxt")
  })

  it("enables skills by default", () => {
    const parsed = parseArgs(["add"])
    expect(parsed.skills).toBe(true)
  })

  it("supports disabling skills via --no-skills", () => {
    const parsed = parseArgs(["add", "--no-skills"])
    expect(parsed.skills).toBe(false)
  })

  it("accepts svelte framework", () => {
    const parsed = parseArgs(["init", "--framework", "svelte"])
    expect(parsed.framework).toBe("svelte")
  })

  it("allows init without framework for auto detection", () => {
    const parsed = parseArgs(["init"])
    expect(parsed.framework).toBeNull()
    expect(parsed.testRunner).toBeNull()
  })

  it("throws for unsupported framework", () => {
    expect(() => parseArgs(["init", "--framework", "angular"])).toThrow(
      "Unsupported framework: angular"
    )
  })

  it("throws for positional dir argument", () => {
    expect(() => parseArgs(["add", "."])).toThrow("Unknown argument: .")
  })

  it("throws for unsupported feature", () => {
    expect(() =>
      parseArgs(["init", "--framework", "node", "--features", "husky,ai"])
    ).toThrow("Unsupported feature in --features: ai")
  })

  it("throws for removed framework version option", () => {
    expect(() =>
      parseArgs(["init", "--framework", "react", "--framework-version", "18"])
    ).toThrow("Unknown argument: --framework-version")
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
    expect(
      resolveFeatures(parseArgs(["add", "--features", "lint,format,husky"]))
    ).toEqual({
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
    const frameworks = [
      "node",
      "react",
      "next",
      "vue",
      "svelte",
      "nuxt",
    ] as const
    for (const framework of frameworks) {
      expect(resolveTestRunner(framework, "jest")).toBe("jest")
      expect(resolveTestRunner(framework, "vitest")).toBe("vitest")
    }
  })
})
