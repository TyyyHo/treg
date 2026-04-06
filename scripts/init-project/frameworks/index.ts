import { nextFramework } from "./next/index.ts"
import { nodeFramework } from "./node/index.ts"
import { nuxtFramework } from "./nuxt/index.ts"
import { reactFramework } from "./react/index.ts"
import { svelteFramework } from "./svelte/index.ts"
import { vueFramework } from "./vue/index.ts"
import type { DetectableFramework, Framework, FrameworkId, PackageJson } from "../types.ts"

const FRAMEWORK_REGISTRY: Record<FrameworkId, DetectableFramework> = {
  next: nextFramework,
  node: nodeFramework,
  nuxt: nuxtFramework,
  react: reactFramework,
  svelte: svelteFramework,
  vue: vueFramework,
}

const FRAMEWORK_DETECT_ORDER: DetectableFramework[] = [
  nuxtFramework,
  nextFramework,
  reactFramework,
  vueFramework,
  svelteFramework,
  nodeFramework,
]

export function resolveFramework(
  frameworkArg: FrameworkId | null,
  packageJson: PackageJson
): Framework {
  if (frameworkArg) {
    return FRAMEWORK_REGISTRY[frameworkArg]
  }

  return detectFramework(packageJson)
}

export function detectFramework(packageJson: PackageJson): DetectableFramework {
  const matched = FRAMEWORK_DETECT_ORDER.find((framework) => framework.matches(packageJson))
  return matched ?? nodeFramework
}
