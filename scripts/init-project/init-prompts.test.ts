import { describe, expect, it } from "@jest/globals"
import { __testables__ } from "./init-prompts.ts"

describe("init prompts helpers", () => {
  it("maps selected features and AI rules toggle", () => {
    expect(__testables__.toFeatureSelection(["lint", "test", "aiRules"])).toEqual({
      enabledFeatures: {
        lint: true,
        format: false,
        typescript: false,
        test: true,
        husky: false,
      },
      aiRules: true,
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
      aiRules: false,
    })
  })

  it("keeps selected AI tools when skip is not selected", () => {
    expect(__testables__.resolveAiToolSelection(["claude", "codex", "gemini"])).toEqual({
      aiRules: true,
      aiTools: ["claude", "codex", "gemini"],
    })
  })

  it("disables AI rules when skip is selected", () => {
    expect(__testables__.resolveAiToolSelection(["skip"])).toEqual({
      aiRules: false,
      aiTools: [],
    })

    expect(__testables__.resolveAiToolSelection(["claude", "skip", "gemini"])).toEqual({
      aiRules: false,
      aiTools: [],
    })
  })
})
