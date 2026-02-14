import { describe, expect, it } from "@jest/globals"
import { parseArgs, resolveFeatures } from "./cli.mjs"

describe("parseArgs", () => {
  it("parses init command options", () => {
    const parsed = parseArgs([
      "init",
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
      frameworkVersion: null,
      features: ["lint", "test"],
      testRunner: "vitest",
      pm: "npm",
      force: true,
      dryRun: true,
      skipHuskyInstall: true,
      skills: false,
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

  it("parses skills flag", () => {
    const parsed = parseArgs(["add", "--skills"])
    expect(parsed.skills).toBe(true)
  })

  it("accepts svelte framework", () => {
    const parsed = parseArgs(["init", "--framework", "svelte"])
    expect(parsed.framework).toBe("svelte")
  })

  it("throws when init is missing framework", () => {
    expect(() => parseArgs(["init"])).toThrow(
      "Missing required option: --framework"
    )
  })

  it("throws for unsupported framework", () => {
    expect(() => parseArgs(["init", "--framework", "angular"])).toThrow(
      "Unsupported framework: angular"
    )
  })

  it("throws for unsupported feature", () => {
    expect(() =>
      parseArgs(["init", "--framework", "node", "--features", "husky,ai"])
    ).toThrow("Unsupported feature in --features: ai")
  })

  it("throws for non-numeric framework version", () => {
    expect(() =>
      parseArgs([
        "init",
        "--framework",
        "react",
        "--framework-version",
        "latest",
      ])
    ).toThrow("Invalid --framework-version: major version must be numeric")
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
