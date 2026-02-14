import { json, packageJson } from "../mrm-core.mjs"
import { installPackages, withProjectCwd } from "./shared.mjs"

const TS_REQUIRED_OPTIONS = {
  noImplicitAny: true,
  noImplicitThis: true,
  exactOptionalPropertyTypes: true,
  noUncheckedIndexedAccess: true,
  noUnusedLocals: true,
  noUnusedParameters: true,
}

export async function runTypescriptRule(context) {
  const { framework, projectDir, pm, dryRun } = context
  installPackages(projectDir, pm, ["typescript"], true, dryRun)

  withProjectCwd(projectDir, () => {
    if (dryRun) {
      console.log("[dry-run] Would update tsconfig.json")
      console.log("[dry-run] Would set package script: type-check")
      return
    }

    const tsconfig = json("tsconfig.json", {
      compilerOptions: {},
      exclude: [],
    })
    const mergedCompilerOptions = {
      ...(tsconfig.get("compilerOptions") ?? {}),
      ...TS_REQUIRED_OPTIONS,
    }
    const exclude = new Set(tsconfig.get("exclude", []))
    for (const entry of framework.tsRequiredExcludes) {
      exclude.add(entry)
    }

    tsconfig
      .set("compilerOptions", mergedCompilerOptions)
      .set("exclude", Array.from(exclude))
      .save()

    packageJson().setScript("type-check", "tsc --noEmit").save()
  })
}
