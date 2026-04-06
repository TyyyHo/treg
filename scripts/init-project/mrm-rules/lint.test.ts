import { describe, expect, it } from "@jest/globals"
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { readFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import {
  DEFAULT_ESLINT_CONFIG,
  ensureEslintConfig,
  findExistingEslintConfig,
} from "./lint-config.ts"

describe("lint rule helpers", () => {
  it("detects an existing eslint config file", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "treg-lint-config-"))
    try {
      writeFileSync(path.join(dir, ".eslintrc.json"), "{}\n", "utf8")

      expect(findExistingEslintConfig(dir)).toBe(".eslintrc.json")
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it("creates eslint.config.mjs when config is missing", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "treg-lint-create-"))
    try {
      await ensureEslintConfig(dir, false)

      const configPath = path.join(dir, "eslint.config.mjs")
      expect(existsSync(configPath)).toBe(true)

      const content = await readFile(configPath, "utf8")
      expect(content).toBe(DEFAULT_ESLINT_CONFIG)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it("does not create eslint.config.mjs when another config exists", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "treg-lint-skip-"))
    try {
      writeFileSync(path.join(dir, "eslint.config.js"), "export default []\n", "utf8")

      await ensureEslintConfig(dir, false)

      expect(existsSync(path.join(dir, "eslint.config.mjs"))).toBe(false)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it("supports dry-run without creating files", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "treg-lint-dry-"))
    try {
      await ensureEslintConfig(dir, true)
      expect(existsSync(path.join(dir, "eslint.config.mjs"))).toBe(false)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
