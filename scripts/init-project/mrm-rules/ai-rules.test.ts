import { __testables__, runAiRulesRule } from "./ai-rules.ts"
import { describe, expect, it } from "@jest/globals"
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"

import path from "node:path"
import { readFile } from "node:fs/promises"
import { tmpdir } from "node:os"

describe("ai-rules helpers", () => {
  it("builds direct prompt section from enabled features", () => {
    const content = __testables__.buildRuleSection({
      enabledFeatures: {
        lint: true,
        format: true,
        typescript: false,
        test: true,
        husky: false,
      },
      testRunner: "vitest",
    })

    expect(content).toContain("### Git rules")
    expect(content).toContain("1. Never use --no-verify")
    expect(content).toContain(
      "2. Unless the user asks, never relax TypeScript, lint, or format constraints, and never skip tests."
    )
    expect(content).toContain("### Validation Rules and Checklist")
    expect(content).toContain("1. Formatting")
    expect(content).toContain("2. Lint Validation")
    expect(content).toContain("3. Test Configuration")
    expect(content).toContain("Prompt: Apply and verify formatting rule.")
    expect(content).toContain("Prompt: Run and validate lint rule.")
    expect(content).toContain("Current test runner: `vitest`")
    expect(content).not.toContain("skills/")
    expect(content).not.toContain("SKILL.md")
  })

  it("appends rule section when no existing section is present", () => {
    const replaced = __testables__.upsertRuleSection(
      "# Header\n\nSome existing content.",
      "### Git rules\n\nnew"
    )

    expect(replaced).toContain("# Header")
    expect(replaced).toContain("new")
    expect(replaced).toContain("Some existing content.")
  })

  it("does not replace legacy header sections", () => {
    const replaced = __testables__.upsertRuleSection(
      "# Header\n\n## Treg AI Skills\n\nold\n\n## Other\n\nkeep",
      "### Git rules\n\nnew"
    )

    expect(replaced).toContain("### Git rules\n\nnew")
    expect(replaced).toContain("## Other\n\nkeep")
    expect(replaced).toContain("old")
  })

  it("resolves all supported docs when they exist", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "treg-ai-rules-"))
    try {
      writeFileSync(path.join(dir, "CLAUDE.md"), "# Claude\n", "utf8")
      writeFileSync(path.join(dir, "AGENTS.md"), "# Agents\n", "utf8")
      writeFileSync(path.join(dir, "GEMINI.md"), "# Gemini\n", "utf8")

      expect(__testables__.resolveAiRulesDocs(dir, ["claude", "codex", "gemini"])).toEqual([
        path.join(dir, "CLAUDE.md"),
        path.join(dir, "AGENTS.md"),
        path.join(dir, "GEMINI.md"),
      ])
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it("resolves selected docs even when files are missing", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "treg-ai-rules-missing-"))
    try {
      expect(__testables__.resolveAiRulesDocs(dir, ["codex", "gemini"])).toEqual([
        path.join(dir, "AGENTS.md"),
        path.join(dir, "GEMINI.md"),
      ])
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it("injects direct guidance into each selected doc without skill files", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "treg-ai-rules-inject-"))
    try {
      writeFileSync(path.join(dir, "CLAUDE.md"), "# Claude\n", "utf8")
      writeFileSync(path.join(dir, "AGENTS.md"), "# Agents\n", "utf8")
      writeFileSync(path.join(dir, "GEMINI.md"), "# Gemini\n", "utf8")

      await runAiRulesRule({
        command: "add",
        projectDir: dir,
        framework: {
          id: "node",
          testEnvironment: "node",
          tsRequiredExcludes: [],
        },
        formatter: "prettier",
        features: [],
        testRunner: "jest",
        pm: "pnpm",
        force: false,
        dryRun: false,
        skipHuskyInstall: false,
        aiRules: true,
        aiTools: ["claude", "codex", "gemini"],
        help: false,
        enabledFeatures: {
          lint: true,
          format: false,
          typescript: false,
          test: false,
          husky: false,
        },
      })

      const claudeDoc = await readFile(path.join(dir, "CLAUDE.md"), "utf8")
      const agentsDoc = await readFile(path.join(dir, "AGENTS.md"), "utf8")
      const geminiDoc = await readFile(path.join(dir, "GEMINI.md"), "utf8")

      expect(claudeDoc).toContain("### Git rules")
      expect(claudeDoc).toContain("Prompt: Run and validate lint rule.")
      expect(agentsDoc).toContain("### Git rules")
      expect(geminiDoc).toContain("### Git rules")
      expect(existsSync(path.join(dir, "skills"))).toBe(false)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it("injects guidance only for selected ai tools", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "treg-ai-rules-selective-"))
    try {
      writeFileSync(path.join(dir, "CLAUDE.md"), "# Claude\n", "utf8")
      writeFileSync(path.join(dir, "AGENTS.md"), "# Agents\n", "utf8")
      writeFileSync(path.join(dir, "GEMINI.md"), "# Gemini\n", "utf8")

      await runAiRulesRule({
        command: "add",
        projectDir: dir,
        framework: {
          id: "node",
          testEnvironment: "node",
          tsRequiredExcludes: [],
        },
        formatter: "prettier",
        features: [],
        testRunner: "jest",
        pm: "pnpm",
        force: false,
        dryRun: false,
        skipHuskyInstall: false,
        aiRules: true,
        aiTools: ["codex"],
        help: false,
        enabledFeatures: {
          lint: true,
          format: false,
          typescript: false,
          test: false,
          husky: false,
        },
      })

      const claudeDoc = await readFile(path.join(dir, "CLAUDE.md"), "utf8")
      const agentsDoc = await readFile(path.join(dir, "AGENTS.md"), "utf8")
      const geminiDoc = await readFile(path.join(dir, "GEMINI.md"), "utf8")

      expect(claudeDoc).not.toContain("### Git rules")
      expect(agentsDoc).toContain("### Git rules")
      expect(geminiDoc).not.toContain("### Git rules")
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it("creates missing selected ai docs and injects guidance", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "treg-ai-rules-create-docs-"))
    try {
      await runAiRulesRule({
        command: "add",
        projectDir: dir,
        framework: {
          id: "node",
          testEnvironment: "node",
          tsRequiredExcludes: [],
        },
        formatter: "prettier",
        features: [],
        testRunner: "jest",
        pm: "pnpm",
        force: false,
        dryRun: false,
        skipHuskyInstall: false,
        aiRules: true,
        aiTools: ["codex", "gemini"],
        help: false,
        enabledFeatures: {
          lint: true,
          format: false,
          typescript: false,
          test: false,
          husky: false,
        },
      })

      const agentsDoc = await readFile(path.join(dir, "AGENTS.md"), "utf8")
      const geminiDoc = await readFile(path.join(dir, "GEMINI.md"), "utf8")

      expect(agentsDoc).not.toContain("# AGENTS")
      expect(agentsDoc).toContain("### Git rules")
      expect(geminiDoc).not.toContain("# GEMINI")
      expect(geminiDoc).toContain("### Git rules")
      expect(existsSync(path.join(dir, "CLAUDE.md"))).toBe(false)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
