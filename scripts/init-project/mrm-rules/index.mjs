import { runAiSkillsRule } from "./ai-skills.mjs"
import { runFormatRule } from "./format.mjs"
import { runHuskyRule } from "./husky.mjs"
import { runLintRule } from "./lint.mjs"
import { runTestJestRule } from "./test-jest.mjs"
import { runTestVitestRule } from "./test-vitest.mjs"
import { runTypescriptRule } from "./typescript.mjs"

export async function runFeatureRules(context) {
  const { enabledFeatures, skills, testRunner } = context

  if (enabledFeatures.format) {
    await runFormatRule(context)
  }
  if (enabledFeatures.lint) {
    await runLintRule(context)
  }
  if (enabledFeatures.typescript) {
    await runTypescriptRule(context)
  }
  if (enabledFeatures.test) {
    if (testRunner === "vitest") {
      await runTestVitestRule(context)
    } else {
      await runTestJestRule(context)
    }
  }
  if (enabledFeatures.husky) {
    await runHuskyRule(context)
  }

  if (skills) {
    await runAiSkillsRule(context)
  }
}
