import { nextFramework } from "./next/index.mjs"
import { nodeFramework } from "./node/index.mjs"
import { nuxtFramework } from "./nuxt/index.mjs"
import { reactFramework, resolveReactFramework } from "./react/index.mjs"
import { svelteFramework } from "./svelte/index.mjs"
import { vueFramework } from "./vue/index.mjs"

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
