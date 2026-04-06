import { hasPackage } from "../../utils.ts"
import type { DetectableFramework, PackageJson } from "../../types.ts"

export const reactFramework: DetectableFramework = {
  id: "react",
  testEnvironment: "jsdom",
  tsRequiredExcludes: ["dist", "coverage", "jest.config.js", "public"],
  matches(packageJson: PackageJson) {
    return hasPackage(packageJson, "react") || hasPackage(packageJson, "react-dom")
  },
}
