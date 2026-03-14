import { describe, expect, it } from "@jest/globals"
import { detectFramework, resolveFramework } from "./frameworks/index.ts"

describe("frameworks", () => {
  it("detects nuxt before next", () => {
    const framework = detectFramework({
      dependencies: { nuxt: "4.0.0", next: "15.0.0", react: "19.0.0" },
    })
    expect(framework.id).toBe("nuxt")
  })

  it("detects next before react", () => {
    const framework = detectFramework({
      dependencies: { next: "15.0.0", react: "19.0.0" },
    })
    expect(framework.id).toBe("next")
  })

  it("detects react from dependencies", () => {
    const framework = detectFramework({ dependencies: { react: "19.0.0" } })
    expect(framework.id).toBe("react")
  })

  it("detects react before vue", () => {
    const framework = detectFramework({
      dependencies: { react: "19.0.0", vue: "3.5.0" },
    })
    expect(framework.id).toBe("react")
  })

  it("detects vue from dependencies", () => {
    expect(detectFramework({ dependencies: { vue: "3.5.0" } }).id).toBe("vue")
  })

  it("detects vue before svelte", () => {
    const framework = detectFramework({
      dependencies: { vue: "3.5.0", svelte: "5.0.0" },
    })
    expect(framework.id).toBe("vue")
  })

  it("detects svelte from dependencies", () => {
    expect(detectFramework({ dependencies: { svelte: "5.0.0" } }).id).toBe(
      "svelte"
    )
  })

  it("falls back to node", () => {
    expect(detectFramework({ dependencies: {} }).id).toBe("node")
  })

  it("resolves explicit framework", () => {
    expect(
      resolveFramework("node", { dependencies: { react: "19.0.0" } }).id
    ).toBe("node")
  })

  it("resolves explicit nuxt framework", () => {
    expect(resolveFramework("nuxt", { dependencies: {} }).id).toBe("nuxt")
  })

  it("resolves explicit react framework", () => {
    const framework = resolveFramework("react", {
      dependencies: { react: "^19.0.0" },
    })
    expect(framework.id).toBe("react")
  })

  it("resolves detected react framework", () => {
    const framework = resolveFramework(null, {
      dependencies: { react: "^19.2.0" },
    })
    expect(framework.id).toBe("react")
  })
})
