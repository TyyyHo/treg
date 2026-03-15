import { describe, expect, it } from "@jest/globals"
import { __testables__ } from "./init-prompts.ts"

describe("init prompts helpers", () => {
  it("parses single-choice by default and index", () => {
    const pmChoices = [
      { value: "pnpm", label: "pnpm" },
      { value: "npm", label: "npm" },
      { value: "yarn", label: "yarn" },
      { value: "bun", label: "bun" },
    ] as const

    expect(__testables__.parseSingleChoice("", pmChoices, "npm")).toMatchObject(
      { ok: true, value: "npm" }
    )
    expect(
      __testables__.parseSingleChoice("4", pmChoices, "npm")
    ).toMatchObject({ ok: true, value: "bun" })
  })

  it("parses test-runner skip choice", () => {
    const testRunnerChoices = [
      { value: "jest", label: "jest" },
      { value: "vitest", label: "vitest" },
      { value: "skip", label: "skip (disable test feature)" },
    ] as const

    expect(
      __testables__.parseSingleChoice("skip", testRunnerChoices, "jest")
    ).toMatchObject({ ok: true, value: "skip" })
    expect(
      __testables__.parseSingleChoice("3", testRunnerChoices, "jest")
    ).toMatchObject({
      ok: true,
      value: "skip",
    })
  })

  it("parses multi-choice by value and index", () => {
    const choices = [
      { value: "claude", label: "Claude" },
      { value: "codex", label: "codex" },
      { value: "gemini", label: "gemini" },
    ] as const

    expect(
      __testables__.parseMultiChoice("1,gemini", choices, ["claude"])
    ).toMatchObject({ ok: true, value: ["claude", "gemini"] })
  })

  it("supports skip for optional multi-choice", () => {
    const choices = [
      { value: "claude", label: "Claude" },
      { value: "codex", label: "codex" },
    ] as const

    expect(__testables__.parseMultiChoice("skip", choices, ["claude"])).toEqual(
      { ok: true, value: [] }
    )
  })

  it("maps all selection to full feature set", () => {
    expect(__testables__.toFeatureSelection(["all"])).toEqual({
      enabledFeatures: {
        lint: true,
        format: true,
        typescript: true,
        test: true,
        husky: true,
      },
      skills: true,
    })
  })

  it("maps specific features without ai skills", () => {
    expect(__testables__.toFeatureSelection(["lint", "test"])).toEqual({
      enabledFeatures: {
        lint: true,
        format: false,
        typescript: false,
        test: true,
        husky: false,
      },
      skills: false,
    })
  })
})
