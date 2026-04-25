import { describe, expect, it } from "@jest/globals"
import { getPackagePresets, getSelectedPackagePresets } from "./packages.ts"

describe("framework package presets", () => {
  it("includes common packages for every framework", () => {
    const frameworks = ["node", "react", "next", "vue", "nuxt", "svelte"] as const
    for (const framework of frameworks) {
      const ids = getPackagePresets(framework).map((preset) => preset.id)
      expect(ids).toContain("zod")
      expect(ids).toContain("date-fns")
    }
  })

  it("uses backend-focused packages for node projects", () => {
    const ids = getPackagePresets("node").map((preset) => preset.id)
    expect(ids).toEqual(expect.arrayContaining(["express", "fastify", "dotenv", "pino", "prisma"]))
  })

  it("includes common React routing and state options", () => {
    const ids = getPackagePresets("react").map((preset) => preset.id)
    expect(ids).toEqual(
      expect.arrayContaining(["redux", "zustand", "react-router", "tanstack-router"])
    )
  })

  it("uses framework-specific i18n packages", () => {
    expect(getSelectedPackagePresets("react", ["i18n"])[0]?.dependencies).toEqual([
      "i18next",
      "react-i18next",
    ])
    expect(getSelectedPackagePresets("next", ["i18n"])[0]?.dependencies).toEqual(["next-intl"])
    expect(getSelectedPackagePresets("vue", ["i18n"])[0]?.dependencies).toEqual(["vue-i18n"])
    expect(getSelectedPackagePresets("nuxt", ["i18n"])[0]?.dependencies).toEqual(["@nuxtjs/i18n"])
    expect(getSelectedPackagePresets("svelte", ["i18n"])[0]?.dependencies).toEqual(["svelte-i18n"])
  })
})
