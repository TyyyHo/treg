import { hasPackage } from "../../utils.ts"

export const vueFramework = {
  id: "vue",
  testEnvironment: "jsdom",
  tsRequiredExcludes: ["dist", "coverage"],
  matches(packageJson) {
    return hasPackage(packageJson, "vue")
  },
}
