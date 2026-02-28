import { hasPackage } from "../../utils.ts"

export const nextFramework = {
  id: "next",
  testEnvironment: "jsdom",
  tsRequiredExcludes: [".next", "dist", "coverage", "jest.config.js", "public"],
  matches(packageJson) {
    return hasPackage(packageJson, "next")
  },
}
