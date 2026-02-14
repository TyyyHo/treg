import { hasPackage } from "../../utils.mjs"

export const svelteFramework = {
  id: "svelte",
  testEnvironment: "jsdom",
  tsRequiredExcludes: ["dist", "coverage", ".svelte-kit"],
  matches(packageJson) {
    return hasPackage(packageJson, "svelte")
  },
}
