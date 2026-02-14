import { hasPackage } from "../../utils.mjs"

export const vueFramework = {
  id: "vue",
  testEnvironment: "jsdom",
  tsRequiredExcludes: ["dist", "coverage"],
  matches(packageJson) {
    return hasPackage(packageJson, "vue")
  },
}
