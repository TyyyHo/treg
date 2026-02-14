import { hasPackage } from "../../utils.mjs"

export const nuxtFramework = {
  id: "nuxt",
  testEnvironment: "jsdom",
  tsRequiredExcludes: [".nuxt", ".output", "dist", "coverage", "public"],
  matches(packageJson) {
    return hasPackage(packageJson, "nuxt")
  },
}
