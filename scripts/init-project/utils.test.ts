import { describe, expect, it } from "@jest/globals"
import { formatStep, hasPackage } from "./utils.ts"

describe("hasPackage", () => {
  it("checks dependencies and devDependencies", () => {
    const pkg = {
      dependencies: { react: "^19.0.0" },
      devDependencies: { eslint: "^9.0.0" },
    }
    expect(hasPackage(pkg, "react")).toBe(true)
    expect(hasPackage(pkg, "eslint")).toBe(true)
    expect(hasPackage(pkg, "typescript")).toBe(false)
  })
})

describe("formatStep", () => {
  it("appends dry-run suffix when needed", () => {
    expect(formatStep(2, 3, "Run mrm rules", true)).toBe("[2/3] Run mrm rules [dry-run]")
  })
})
