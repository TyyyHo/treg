import { describe, expect, it } from "@jest/globals"
import { __testables__ } from "./init-prompts.ts"

describe("init prompts helpers", () => {
  it("maps selected features and skills", () => {
    expect(
      __testables__.toFeatureSelection(["lint", "test", "skills"])
    ).toEqual({
      enabledFeatures: {
        lint: true,
        format: false,
        typescript: false,
        test: true,
        husky: false,
      },
      skills: true,
    })
  })

  it("maps empty selection to all disabled", () => {
    expect(__testables__.toFeatureSelection([])).toEqual({
      enabledFeatures: {
        lint: false,
        format: false,
        typescript: false,
        test: false,
        husky: false,
      },
      skills: false,
    })
  })

  it("keeps selected AI tools when skip is not selected", () => {
    expect(
      __testables__.resolveAiToolSelection(["claude", "codex", "gemini"])
    ).toEqual({
      skills: true,
      aiTools: ["claude", "codex", "gemini"],
    })
  })

  it("disables AI skills when skip is selected", () => {
    expect(__testables__.resolveAiToolSelection(["skip"])).toEqual({
      skills: false,
      aiTools: [],
    })

    expect(
      __testables__.resolveAiToolSelection(["claude", "skip", "gemini"])
    ).toEqual({
      skills: false,
      aiTools: [],
    })
  })
})
