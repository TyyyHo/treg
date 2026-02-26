import { hasPackage } from "../../utils.ts"
import { reactV18Framework } from "./v18/index.ts"
import { reactV19Framework } from "./v19/index.ts"

export const reactFramework = {
  id: "react",
  variant: "v19",
  testEnvironment: "jsdom",
  tsRequiredExcludes: ["dist", "coverage", "jest.config.js", "public"],
  matches(packageJson) {
    return (
      hasPackage(packageJson, "react") || hasPackage(packageJson, "react-dom")
    )
  },
}

const REACT_VARIANTS = {
  18: reactV18Framework,
  19: reactV19Framework,
}

export function resolveReactFramework(packageJson, frameworkVersion) {
  if (frameworkVersion && REACT_VARIANTS[frameworkVersion]) {
    return REACT_VARIANTS[frameworkVersion]
  }

  const detected =
    packageJson?.dependencies?.react ?? packageJson?.devDependencies?.react
  const major = typeof detected === "string" ? detected.match(/\d+/)?.[0] : null
  if (major && REACT_VARIANTS[major]) {
    return REACT_VARIANTS[major]
  }

  return reactFramework
}
