import { describe, expect, it } from "@jest/globals"
import {
  isSolutionStyleTsconfig,
  mergeCompilerOptions,
  normalizeTypesValue,
  resolveTsconfigTargets,
  shouldIncludeNodeTypes,
} from "./typescript-options.ts"

describe("typescript rule helpers", () => {
  it("adds node type for node projects when types is missing", () => {
    const merged = mergeCompilerOptions({}, true)
    expect(merged.types).toEqual(["node"])
  })

  it("keeps existing types and appends node when enabled", () => {
    const merged = mergeCompilerOptions(
      {
        types: ["vite/client", "jest"],
      },
      true
    )
    expect(merged.types).toEqual(["vite/client", "jest", "node"])
  })

  it("deduplicates node type when enabled and already present", () => {
    const merged = mergeCompilerOptions(
      {
        types: ["node", "vite/client"],
      },
      true
    )
    expect(merged.types).toEqual(["node", "vite/client"])
  })

  it("replaces invalid types value with node when enabled", () => {
    const merged = mergeCompilerOptions(
      {
        types: "node",
      },
      true
    )
    expect(merged.types).toEqual(["node"])
  })

  it("always enforces required strict compiler options", () => {
    const merged = mergeCompilerOptions(
      {
        strict: false,
        noImplicitAny: false,
      },
      true
    )

    expect(merged.strict).toBe(true)
    expect(merged.noImplicitAny).toBe(true)
    expect(merged.noUnusedLocals).toBe(true)
  })

  it("does not inject node type when disabled", () => {
    const merged = mergeCompilerOptions({}, false)
    expect(merged).not.toHaveProperty("types")
  })

  it("keeps existing types untouched when node injection is disabled", () => {
    const merged = mergeCompilerOptions(
      {
        types: ["vite/client", "jest"],
      },
      false
    )
    expect(merged.types).toEqual(["vite/client", "jest"])
  })

  it("filters non-string values in types", () => {
    expect(normalizeTypesValue(["node", 1, null, "vite/client"])).toEqual(["node", "vite/client"])
  })

  it("enables node types only for node framework", () => {
    expect(shouldIncludeNodeTypes("node")).toBe(true)
    expect(shouldIncludeNodeTypes("next")).toBe(false)
    expect(shouldIncludeNodeTypes("nuxt")).toBe(false)
    expect(shouldIncludeNodeTypes("react")).toBe(false)
    expect(shouldIncludeNodeTypes("vue")).toBe(false)
    expect(shouldIncludeNodeTypes("svelte")).toBe(false)
  })

  it("detects solution-style tsconfig with files/references", () => {
    expect(
      isSolutionStyleTsconfig(
        [],
        [{ path: "./tsconfig.node.json" }, { path: "./tsconfig.app.json" }]
      )
    ).toBe(true)
  })

  it("does not treat regular tsconfig as solution-style", () => {
    expect(isSolutionStyleTsconfig(undefined, [{ path: "./tsconfig.app.json" }])).toBe(false)
    expect(isSolutionStyleTsconfig([], [{ notPath: "./tsconfig.app.json" }])).toBe(false)
    expect(isSolutionStyleTsconfig([], [])).toBe(false)
  })

  it("uses root tsconfig target when references are not present", () => {
    expect(resolveTsconfigTargets("node", undefined, undefined)).toEqual([
      { path: "tsconfig.json", includeNodeTypes: true },
    ])
    expect(resolveTsconfigTargets("vue", undefined, undefined)).toEqual([
      { path: "tsconfig.json", includeNodeTypes: false },
    ])
  })

  it("maps solution-style references to node and vue targets", () => {
    expect(
      resolveTsconfigTargets("vue", undefined, [
        { path: "./tsconfig.node.json" },
        { path: "./tsconfig.app.json" },
        { path: "./tsconfig.vitest.json" },
      ])
    ).toEqual([
      { path: "./tsconfig.node.json", includeNodeTypes: true },
      { path: "./tsconfig.app.json", includeNodeTypes: false },
    ])
  })

  it("maps references even when files is not an empty array", () => {
    expect(
      resolveTsconfigTargets(
        "vue",
        ["src/main.ts"],
        [{ path: "./tsconfig.node.json" }, { path: "./tsconfig.app.json" }]
      )
    ).toEqual([
      { path: "./tsconfig.node.json", includeNodeTypes: true },
      { path: "./tsconfig.app.json", includeNodeTypes: false },
    ])
  })

  it("returns empty targets when solution-style has no node/app reference", () => {
    expect(resolveTsconfigTargets("vue", [], [{ path: "./tsconfig.vitest.json" }])).toEqual([])
  })
})
