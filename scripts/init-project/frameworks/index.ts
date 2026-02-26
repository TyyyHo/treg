import { nextFramework } from "./next/index.ts"
import { nodeFramework } from "./node/index.ts"
import { nuxtFramework } from "./nuxt/index.ts"
import { reactFramework, resolveReactFramework } from "./react/index.ts"
import { svelteFramework } from "./svelte/index.ts"
import { vueFramework } from "./vue/index.ts"

const FRAMEWORK_REGISTRY = {
  next: nextFramework,
  node: nodeFramework,
  nuxt: nuxtFramework,
  react: reactFramework,
  svelte: svelteFramework,
  vue: vueFramework,
}

const FRAMEWORK_DETECT_ORDER = [
  nuxtFramework,
  nextFramework,
  reactFramework,
  vueFramework,
  svelteFramework,
  nodeFramework,
]

export function resolveFramework(frameworkArg, frameworkVersion, packageJson) {
  if (frameworkArg === "react") {
    return resolveReactFramework(packageJson, frameworkVersion)
  }

  if (frameworkArg) {
    return FRAMEWORK_REGISTRY[frameworkArg]
  }

  const detected = detectFramework(packageJson)
  if (detected.id === "react") {
    return resolveReactFramework(packageJson, frameworkVersion)
  }

  return detected
}

export function detectFramework(packageJson) {
  const matched = FRAMEWORK_DETECT_ORDER.find(framework =>
    framework.matches(packageJson)
  )
  return matched ?? nodeFramework
}
