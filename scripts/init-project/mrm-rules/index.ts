import { runAiRulesRule } from "./ai-rules.ts"
import { runFormatRule } from "./format.ts"
import { runHuskyRule } from "./husky.ts"
import { runLintRule } from "./lint.ts"
import { runPackagesRule } from "./packages.ts"
import { runTestJestRule } from "./test-jest.ts"
import { runTestVitestRule } from "./test-vitest.ts"
import { runTypescriptRule } from "./typescript.ts"
import type { RuleContext } from "../types.ts"

export async function runFeatureRules(context: RuleContext): Promise<void> {
  const { enabledFeatures, aiRules, testRunner } = context

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
  await runPackagesRule(context)

  if (aiRules) {
    await runAiRulesRule(context)
  }
}
