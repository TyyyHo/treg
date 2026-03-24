import { describe, expect, it } from "@jest/globals"
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { readFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { __testables__, runAiRulesRule } from "./ai-rules.ts"

describe("ai-rules helpers", () => {
  it("builds rule section from enabled features", () => {
    const content = __testables__.buildSkillSection({
      enabledFeatures: {
        lint: true,
        format: true,
        typescript: false,
        test: true,
        husky: false,
      },
      testRunner: "vitest",
    })

    expect(content).toContain("## Treg AI Rules")
    expect(content).toContain("### Git rules")
    expect(content).toContain("1. Never use --no-verify")
    expect(content).toContain(
      "2. Unless the user asks, never relax TypeScript, lint, or format constraints, and never skip tests."
    )
    expect(content).toContain("### Steps and Rule Mapping")
    expect(content).toContain(
      "1. Formatting: use [format](skills/format/SKILL.md)"
    )
    expect(content).toContain(
      "2. Lint Validation: use [lint](skills/lint/SKILL.md)"
    )
    expect(content).toContain(
      "3. Test Configuration: use [test](skills/test/SKILL.md)"
    )
    expect(content).toContain("Current test runner: `vitest`")
    expect(content).not.toContain("TypeScript Settings")
    expect(content).not.toContain("<!-- treg:skills:")
  })

  it("appends rule section when no existing section is present", () => {
    const replaced = __testables__.upsertSkillSection(
      "# Header\n\nSome existing content.",
      "## Treg AI Rules\n\nnew"
    )

    expect(replaced).toContain("# Header")
    expect(replaced).toContain("new")
    expect(replaced).toContain("Some existing content.")
  })

  it("upserts an existing rule section without markers", () => {
    const replaced = __testables__.upsertSkillSection(
      "# Header\n\n## Treg AI Skills\n\nold\n\n## Other\n\nkeep",
      "## Treg AI Rules\n\nnew"
    )

    expect(replaced).toContain("## Treg AI Rules\n\nnew")
    expect(replaced).toContain("## Other\n\nkeep")
    expect(replaced).not.toContain("old")
  })

  it("resolves all supported docs when they exist", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "treg-skill-"))
    try {
      writeFileSync(path.join(dir, "CLAUDE.md"), "# Claude\n", "utf8")
      writeFileSync(path.join(dir, "AGENTS.md"), "# Agents\n", "utf8")
      writeFileSync(path.join(dir, "GEMINI.md"), "# Gemini\n", "utf8")

      expect(
        __testables__.resolveSkillsDocs(dir, ["claude", "codex", "gemini"])
      ).toEqual([
        path.join(dir, "CLAUDE.md"),
        path.join(dir, "AGENTS.md"),
        path.join(dir, "GEMINI.md"),
      ])
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it("resolves selected docs even when files are missing", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "treg-skill-missing-"))
    try {
      expect(__testables__.resolveSkillsDocs(dir, ["codex", "gemini"])).toEqual(
        [path.join(dir, "AGENTS.md"), path.join(dir, "GEMINI.md")]
      )
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it("injects guidance into each existing doc and writes skills once", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "treg-skill-inject-"))
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
        skills: true,
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
      const lintSkillPath = path.join(dir, "skills/lint/SKILL.md")

      expect(claudeDoc).toContain("## Treg AI Rules")
      expect(claudeDoc).toContain("[lint](skills/lint/SKILL.md)")
      expect(agentsDoc).toContain("## Treg AI Rules")
      expect(geminiDoc).toContain("## Treg AI Rules")
      expect(existsSync(lintSkillPath)).toBe(true)
      expect(existsSync(path.join(dir, "skills/format/SKILL.md"))).toBe(false)
      expect(existsSync(path.join(dir, "skills/test/SKILL.md"))).toBe(false)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it("injects guidance only for selected ai tools", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "treg-skill-selective-"))
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
        skills: true,
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

      expect(claudeDoc).not.toContain("## Treg AI Rules")
      expect(agentsDoc).toContain("## Treg AI Rules")
      expect(geminiDoc).not.toContain("## Treg AI Rules")
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it("creates missing selected ai docs and injects guidance", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "treg-skill-create-docs-"))
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
        skills: true,
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
      expect(agentsDoc).toContain("## Treg AI Rules")
      expect(geminiDoc).not.toContain("# GEMINI")
      expect(geminiDoc).toContain("## Treg AI Rules")
      expect(existsSync(path.join(dir, "CLAUDE.md"))).toBe(false)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it("builds rule file content with frontmatter", () => {
    const content = __testables__.buildSkillFile(
      "test",
      {
        name: "test",
        description: "Apply and verify test runner rule.",
        when: "When test rules are added or test configuration changes.",
        checklist: [
          "Confirm the selected test runner matches the project setup.",
          "Run `test`.",
        ],
      },
      "vitest"
    )

    expect(content).toContain("name: test")
    expect(content).toContain("description: Apply and verify test runner rule.")
    expect(content).toContain("## Current Test Runner")
    expect(content).toContain("`vitest`")
  })

  it("creates skill files for enabled features", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "treg-skill-files-"))
    try {
      await __testables__.ensureSkillFiles(dir, ["lint", "test"], "jest", false)

      const lintSkill = await readFile(
        path.join(dir, "skills/lint/SKILL.md"),
        "utf8"
      )
      const testSkill = await readFile(
        path.join(dir, "skills/test/SKILL.md"),
        "utf8"
      )

      expect(lintSkill).toContain("name: lint")
      expect(testSkill).toContain("## Current Test Runner")
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
