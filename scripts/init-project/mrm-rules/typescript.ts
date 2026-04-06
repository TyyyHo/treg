import { json, packageJson } from "../mrm-core.ts"
import { installPackages, withProjectCwd } from "./shared.ts"
import type { RuleContext } from "../types.ts"
import { mergeCompilerOptions, resolveTsconfigTargets } from "./typescript-options.ts"

export async function runTypescriptRule(context: RuleContext): Promise<void> {
  const { framework, projectDir, pm, dryRun } = context
  const packages = ["typescript", "@types/node"]
  installPackages(projectDir, pm, packages, true, dryRun)

  withProjectCwd(projectDir, () => {
    if (dryRun) {
      console.log("[dry-run] Would update tsconfig.json")
      console.log("[dry-run] Would set package script: type:check")
      return
    }

    const tsconfig = json("tsconfig.json", {
      compilerOptions: {},
      exclude: [],
    })
    const targets = resolveTsconfigTargets(
      framework.id,
      tsconfig.get("files"),
      tsconfig.get("references")
    )
    if (targets.length === 0) {
      console.log(
        "Detected solution-style tsconfig.json without tsconfig.node.json or tsconfig.app.json references. Skip TypeScript rule update."
      )
      packageJson().setScript("type:check", "tsc --noEmit").save()
      return
    }

    for (const target of targets) {
      const targetTsconfig =
        target.path === "tsconfig.json"
          ? tsconfig
          : json(target.path, {
              compilerOptions: {},
              exclude: [],
            })
      const mergedCompilerOptions = mergeCompilerOptions(
        (targetTsconfig.get("compilerOptions") ?? {}) as Record<string, unknown>,
        target.includeNodeTypes
      )
      const exclude = new Set(targetTsconfig.get("exclude", []))
      for (const entry of framework.tsRequiredExcludes) {
        exclude.add(entry)
      }

      targetTsconfig
        .set("compilerOptions", mergedCompilerOptions)
        .set("exclude", Array.from(exclude))
        .save()
    }

    packageJson().setScript("type:check", "tsc --noEmit").save()
  })
}
