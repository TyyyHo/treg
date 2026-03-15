import { describe, expect, it } from "@jest/globals"
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { readFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { __testables__, runAiSkillsRule } from "./ai-skills.ts"

describe("ai-skills helpers", () => {
  it("builds skill section from enabled features", () => {
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

    expect(content).toContain("## treg AI Skills")
    expect(content).toContain("### Steps and Skill Mapping")
    expect(content).toContain(
      "1. Formatting: use [treg/format](skills/format/SKILL.md)"
    )
    expect(content).toContain(
      "2. Lint Validation: use [treg/lint](skills/lint/SKILL.md)"
    )
    expect(content).toContain(
      "3. Test Configuration: use [treg/test](skills/test/SKILL.md)"
    )
    expect(content).toContain("Current test runner: `vitest`")
    expect(content).not.toContain("TypeScript Settings")
    expect(content).not.toContain("<!-- treg:skills:")
  })

  it("upserts an existing skill section with legacy markers", () => {
    const replaced = __testables__.upsertSkillSection(
      "# Header\n\n<!-- treg:skills:start -->\nold\n<!-- treg:skills:end -->\n",
      "## treg AI Skills\n\nnew"
    )

    expect(replaced).toContain("new")
    expect(replaced).not.toContain("old")
    expect(replaced).not.toContain("<!-- treg:skills:")
  })

  it("upserts an existing skill section without markers", () => {
    const replaced = __testables__.upsertSkillSection(
      "# Header\n\n## treg AI Skills\n\nold\n\n## Other\n\nkeep",
      "## treg AI Skills\n\nnew"
    )

    expect(replaced).toContain("## treg AI Skills\n\nnew")
    expect(replaced).toContain("## Other\n\nkeep")
    expect(replaced).not.toContain("old")
  })

  it("resolves all supported docs when they exist", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "treg-skill-"))
    try {
      writeFileSync(path.join(dir, "CLAUDE.md"), "# Claude\n", "utf8")
      writeFileSync(path.join(dir, "AGENTS.md"), "# Agents\n", "utf8")
      writeFileSync(path.join(dir, "GEMINI.md"), "# Gemini\n", "utf8")

      expect(__testables__.resolveSkillsDocs(dir)).toEqual([
        path.join(dir, "CLAUDE.md"),
        path.join(dir, "AGENTS.md"),
        path.join(dir, "GEMINI.md"),
      ])
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

      await runAiSkillsRule({
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

      expect(claudeDoc).toContain("## treg AI Skills")
      expect(claudeDoc).toContain("[treg/lint](skills/lint/SKILL.md)")
      expect(agentsDoc).toContain("## treg AI Skills")
      expect(geminiDoc).toContain("## treg AI Skills")
      expect(existsSync(lintSkillPath)).toBe(true)
      expect(existsSync(path.join(dir, "skills/format/SKILL.md"))).toBe(false)
      expect(existsSync(path.join(dir, "skills/test/SKILL.md"))).toBe(false)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it("builds skill file content with frontmatter", () => {
    const content = __testables__.buildSkillFile(
      "test",
      {
        name: "treg/test",
        description: "Validate test runner setup and execution.",
        when: "When test rules are added or test configuration changes.",
        checklist: [
          "Confirm the selected test runner matches the project setup.",
          "Run `test`.",
        ],
      },
      "vitest"
    )

    expect(content).toContain("name: treg/test")
    expect(content).toContain("description: Validate test runner setup")
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

      expect(lintSkill).toContain("name: treg/lint")
      expect(testSkill).toContain("## Current Test Runner")
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
