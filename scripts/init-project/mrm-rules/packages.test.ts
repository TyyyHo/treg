import { describe, expect, it } from "@jest/globals"
import { __testables__, buildPackageInstallPlan } from "./packages.ts"
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import path from "node:path"
import { readFile } from "node:fs/promises"
import { tmpdir } from "node:os"

describe("packages rule", () => {
  it("separates runtime and dev dependencies", () => {
    expect(
      buildPackageInstallPlan([
        {
          id: "tailwind",
          label: "Tailwind CSS",
          description: "Styling",
          devDependencies: ["tailwindcss"],
          aiRule: {
            prompt: "Use Tailwind.",
            when: "When styling.",
            checklist: ["Check classes."],
          },
        },
        {
          id: "zustand",
          label: "Zustand",
          description: "State",
          dependencies: ["zustand"],
          aiRule: {
            prompt: "Use Zustand.",
            when: "When state is shared.",
            checklist: ["Keep stores focused."],
          },
        },
      ])
    ).toEqual({
      dependencies: ["zustand"],
      devDependencies: ["tailwindcss"],
    })
  })

  it("detects TypeScript projects from tsconfig", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "treg-cn-ts-"))
    try {
      writeFileSync(path.join(dir, "tsconfig.json"), "{}", "utf8")
      expect(__testables__.hasTypeScript(dir)).toBe(true)
      expect(__testables__.getCnHelperContent(dir)).toContain("type ClassValue")
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it("creates cn.ts in lib for TypeScript projects", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "treg-cn-helper-ts-"))
    try {
      writeFileSync(path.join(dir, "tsconfig.json"), "{}", "utf8")

      await __testables__.ensureCnHelper(dir, false, false)

      const target = path.join(dir, "lib", "cn.ts")
      expect(existsSync(target)).toBe(true)
      await expect(readFile(target, "utf8")).resolves.toContain("clsx")
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it("creates cn.js in app/lib for JavaScript projects when app/lib exists", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "treg-cn-helper-js-"))
    try {
      mkdirSync(path.join(dir, "app", "lib"), { recursive: true })

      await __testables__.ensureCnHelper(dir, false, false)

      const target = path.join(dir, "app", "lib", "cn.js")
      expect(existsSync(target)).toBe(true)
      await expect(readFile(target, "utf8")).resolves.toContain("export function cn")
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it("prefers existing lib over app/lib", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "treg-cn-lib-choice-"))
    try {
      mkdirSync(path.join(dir, "lib"), { recursive: true })
      mkdirSync(path.join(dir, "app", "lib"), { recursive: true })

      expect(__testables__.resolveLibDir(dir)).toBe("lib")
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
