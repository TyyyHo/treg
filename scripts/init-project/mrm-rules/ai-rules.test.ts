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
    expect(content).toContain("2. Branch names must use `<type>/<summary-kebab-case>`")
    expect(content).toContain("3. Commit messages must use `<type>: <summary>`")
    expect(content).toContain(
      "4. Recommended commit types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `build`, `ci`."
    )
    expect(content).toContain(
      "5. Unless the user asks, never relax TypeScript, lint, or format constraints, and never skip tests."
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

  it("builds package guidance from selected package presets", () => {
    const content = __testables__.buildRuleSection({
      framework: {
        id: "react",
        testEnvironment: "jsdom",
        tsRequiredExcludes: [],
      },
      selectedPackageIds: ["tailwind", "zustand", "tanstack-query"],
      enabledFeatures: {
        lint: false,
        format: false,
        typescript: false,
        test: false,
        husky: false,
      },
      testRunner: "jest",
    })

    expect(content).toContain("### Package Rules and Checklist")
    expect(content).toContain("1. Tailwind CSS")
    expect(content).toContain("2. Zustand")
    expect(content).toContain("3. TanStack Query")
    expect(content).toContain("Prompt: Use Zustand for client-only state")
    expect(content).toContain("Prefer Tailwind built-in utilities or project-defined class names")
    expect(content).toContain(
      "Split stores by a single feature that can be described in one sentence"
    )
    expect(content).toContain("Before adding global state, verify the state cannot stay local")
  })

  it("reads package guidance from an existing rule section", () => {
    const content = __testables__.buildRuleSection({
      framework: {
        id: "react",
        testEnvironment: "jsdom",
        tsRequiredExcludes: [],
      },
      selectedPackageIds: ["tailwind", "zustand"],
      enabledFeatures: {
        lint: false,
        format: false,
        typescript: false,
        test: false,
        husky: false,
      },
      testRunner: "jest",
    })

    expect(
      __testables__.readPackageIdsFromRuleSection(content, {
        id: "react",
        testEnvironment: "jsdom",
        tsRequiredExcludes: [],
      })
    ).toEqual(["tailwind", "zustand"])
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

  it("resolves existing docs as rule targets when no doc delegates to AGENTS", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "treg-ai-rules-"))
    try {
      writeFileSync(path.join(dir, "CLAUDE.md"), "# Claude\n", "utf8")
      writeFileSync(path.join(dir, "AGENTS.md"), "# Agents\n", "utf8")
      writeFileSync(path.join(dir, "GEMINI.md"), "# Gemini\n", "utf8")

      await expect(__testables__.resolveAiRulesDocs(dir)).resolves.toEqual([
        { filePath: path.join(dir, "AGENTS.md"), mode: "rules" },
        { filePath: path.join(dir, "CLAUDE.md"), mode: "rules" },
        { filePath: path.join(dir, "GEMINI.md"), mode: "rules" },
      ])
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it("resolves only existing docs when no doc delegates to AGENTS", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "treg-ai-rules-missing-"))
    try {
      writeFileSync(path.join(dir, "GEMINI.md"), "# Gemini\n", "utf8")

      await expect(__testables__.resolveAiRulesDocs(dir)).resolves.toEqual([
        { filePath: path.join(dir, "GEMINI.md"), mode: "rules" },
      ])
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it("resolves AGENTS only when Claude or Gemini delegates to AGENTS", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "treg-ai-rules-missing-"))
    try {
      writeFileSync(path.join(dir, "GEMINI.md"), "@AGENTS.md\n", "utf8")

      await expect(__testables__.resolveAiRulesDocs(dir)).resolves.toEqual([
        { filePath: path.join(dir, "AGENTS.md"), mode: "rules" },
      ])
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it("resolves non-delegating docs with AGENTS when another doc delegates", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "treg-ai-rules-mixed-"))
    try {
      writeFileSync(path.join(dir, "AGENTS.md"), "# Agents\n", "utf8")
      writeFileSync(path.join(dir, "CLAUDE.md"), "# Claude\n", "utf8")
      writeFileSync(path.join(dir, "GEMINI.md"), "@AGENTS.md\n", "utf8")

      await expect(__testables__.resolveAiRulesDocs(dir)).resolves.toEqual([
        { filePath: path.join(dir, "AGENTS.md"), mode: "rules" },
        { filePath: path.join(dir, "CLAUDE.md"), mode: "rules" },
      ])
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it("resolves all three docs when none exist", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "treg-ai-rules-missing-"))
    try {
      await expect(__testables__.resolveAiRulesDocs(dir)).resolves.toEqual([
        { filePath: path.join(dir, "AGENTS.md"), mode: "rules" },
        { filePath: path.join(dir, "CLAUDE.md"), mode: "agentsReference" },
        { filePath: path.join(dir, "GEMINI.md"), mode: "agentsReference" },
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
        addTarget: null,
        features: [],
        testRunner: "jest",
        pm: "pnpm",
        force: false,
        dryRun: false,
        skipHuskyInstall: false,
        aiRules: true,
        aiTools: ["claude", "codex", "gemini"],
        help: false,
        selectedPackageIds: [],
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

  it("injects guidance into AGENTS and non-delegating docs", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "treg-ai-rules-selective-"))
    try {
      writeFileSync(path.join(dir, "CLAUDE.md"), "# Claude\n", "utf8")
      writeFileSync(path.join(dir, "AGENTS.md"), "# Agents\n", "utf8")
      writeFileSync(path.join(dir, "GEMINI.md"), "# Gemini\n\n@AGENTS.md\n", "utf8")

      await runAiRulesRule({
        command: "add",
        projectDir: dir,
        framework: {
          id: "node",
          testEnvironment: "node",
          tsRequiredExcludes: [],
        },
        formatter: "prettier",
        addTarget: null,
        features: [],
        testRunner: "jest",
        pm: "pnpm",
        force: false,
        dryRun: false,
        skipHuskyInstall: false,
        aiRules: true,
        aiTools: ["claude", "codex", "gemini"],
        help: false,
        selectedPackageIds: [],
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
      expect(agentsDoc).toContain("### Git rules")
      expect(geminiDoc).not.toContain("### Git rules")
      expect(geminiDoc).toContain("@AGENTS.md")
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it("add creates all AI docs with AGENTS as the rule source when none exist", async () => {
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
        addTarget: null,
        features: [],
        testRunner: "jest",
        pm: "pnpm",
        force: false,
        dryRun: false,
        skipHuskyInstall: false,
        aiRules: true,
        aiTools: ["codex", "gemini"],
        help: false,
        selectedPackageIds: [],
        enabledFeatures: {
          lint: true,
          format: false,
          typescript: false,
          test: false,
          husky: false,
        },
      })

      expect(existsSync(path.join(dir, "AGENTS.md"))).toBe(true)
      expect(existsSync(path.join(dir, "GEMINI.md"))).toBe(true)
      expect(existsSync(path.join(dir, "CLAUDE.md"))).toBe(true)

      const agentsDoc = await readFile(path.join(dir, "AGENTS.md"), "utf8")
      const claudeDoc = await readFile(path.join(dir, "CLAUDE.md"), "utf8")
      const geminiDoc = await readFile(path.join(dir, "GEMINI.md"), "utf8")

      expect(agentsDoc).toContain("### Git rules")
      expect(claudeDoc).toBe("@AGENTS.md\n")
      expect(geminiDoc).toBe("@AGENTS.md\n")
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it("init updates existing docs without creating missing docs when no doc delegates to AGENTS", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "treg-ai-rules-create-docs-"))
    try {
      writeFileSync(path.join(dir, "GEMINI.md"), "# Gemini\n", "utf8")

      await runAiRulesRule({
        command: "init",
        projectDir: dir,
        framework: {
          id: "node",
          testEnvironment: "node",
          tsRequiredExcludes: [],
        },
        formatter: "prettier",
        addTarget: null,
        features: [],
        testRunner: "jest",
        pm: "pnpm",
        force: false,
        dryRun: false,
        skipHuskyInstall: false,
        aiRules: true,
        aiTools: ["codex", "gemini"],
        help: false,
        selectedPackageIds: [],
        enabledFeatures: {
          lint: true,
          format: false,
          typescript: false,
          test: false,
          husky: false,
        },
      })

      const geminiDoc = await readFile(path.join(dir, "GEMINI.md"), "utf8")

      expect(existsSync(path.join(dir, "AGENTS.md"))).toBe(false)
      expect(existsSync(path.join(dir, "CLAUDE.md"))).toBe(false)
      expect(geminiDoc).toContain("### Git rules")
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it("preserves existing feature guidance when add installs only specific features", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "treg-ai-rules-preserve-add-"))
    try {
      writeFileSync(path.join(dir, "AGENTS.md"), "# Agents\n", "utf8")

      await runAiRulesRule({
        command: "add",
        projectDir: dir,
        framework: {
          id: "node",
          testEnvironment: "node",
          tsRequiredExcludes: [],
        },
        formatter: "prettier",
        addTarget: null,
        features: ["test"],
        testRunner: "jest",
        pm: "pnpm",
        force: false,
        dryRun: false,
        skipHuskyInstall: false,
        aiRules: true,
        aiTools: ["codex"],
        help: false,
        selectedPackageIds: [],
        enabledFeatures: {
          lint: false,
          format: false,
          typescript: false,
          test: true,
          husky: false,
        },
      })

      await runAiRulesRule({
        command: "add",
        projectDir: dir,
        framework: {
          id: "node",
          testEnvironment: "node",
          tsRequiredExcludes: [],
        },
        formatter: "prettier",
        addTarget: null,
        features: ["format"],
        testRunner: "vitest",
        pm: "pnpm",
        force: false,
        dryRun: false,
        skipHuskyInstall: false,
        aiRules: true,
        aiTools: ["codex"],
        help: false,
        selectedPackageIds: [],
        enabledFeatures: {
          lint: false,
          format: true,
          typescript: false,
          test: false,
          husky: false,
        },
      })

      const agentsDoc = await readFile(path.join(dir, "AGENTS.md"), "utf8")

      expect(agentsDoc).toContain("1. Formatting")
      expect(agentsDoc).toContain("2. Test Configuration")
      expect(agentsDoc).toContain("Current test runner: `jest`")
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
