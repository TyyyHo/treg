import { hasPackage } from "../../utils.ts"

export const nuxtFramework = {
  id: "nuxt",
  testEnvironment: "jsdom",
  tsRequiredExcludes: [".nuxt", ".output", "dist", "coverage", "public"],
  matches(packageJson) {
    return hasPackage(packageJson, "nuxt")
  },
}
