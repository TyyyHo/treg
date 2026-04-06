import { mkdtemp, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { describe, expect, it } from "@jest/globals"
import { __testables__, detectPackageManager } from "./package-manager.ts"

describe("detectPackageManager", () => {
  it("defaults to npm when no lockfile exists", async () => {
    const baseDir = await mkdtemp(path.join(os.tmpdir(), "treg-pm-"))
    expect(detectPackageManager(baseDir)).toBe("npm")
  })

  it("detects pnpm from lockfile", async () => {
    const baseDir = await mkdtemp(path.join(os.tmpdir(), "treg-pm-"))
    await writeFile(path.join(baseDir, "pnpm-lock.yaml"), "lockfileVersion: 9\n")
    expect(detectPackageManager(baseDir)).toBe("pnpm")
  })

  it("detects bun from lockfile", async () => {
    const baseDir = await mkdtemp(path.join(os.tmpdir(), "treg-pm-"))
    await writeFile(path.join(baseDir, "bun.lockb"), "")
    expect(detectPackageManager(baseDir)).toBe("bun")
  })
})

describe("npm legacy peer dependency fallback", () => {
  it("enables legacy peer deps for react-scripts with TypeScript 5+", async () => {
    const baseDir = await mkdtemp(path.join(os.tmpdir(), "treg-pm-"))
    await writeFile(
      path.join(baseDir, "package.json"),
      JSON.stringify(
        {
          devDependencies: {
            "react-scripts": "^5.0.1",
            typescript: "^5.9.3",
          },
        },
        null,
        2
      )
    )

    expect(__testables__.shouldUseNpmLegacyPeerDeps(baseDir)).toBe(true)
  })

  it("does not enable legacy peer deps when TypeScript is below 5", async () => {
    const baseDir = await mkdtemp(path.join(os.tmpdir(), "treg-pm-"))
    await writeFile(
      path.join(baseDir, "package.json"),
      JSON.stringify(
        {
          devDependencies: {
            "react-scripts": "^5.0.1",
            typescript: "^4.9.5",
          },
        },
        null,
        2
      )
    )

    expect(__testables__.shouldUseNpmLegacyPeerDeps(baseDir)).toBe(false)
  })

  it("does not enable legacy peer deps without react-scripts", async () => {
    const baseDir = await mkdtemp(path.join(os.tmpdir(), "treg-pm-"))
    await writeFile(
      path.join(baseDir, "package.json"),
      JSON.stringify(
        {
          devDependencies: {
            typescript: "^5.9.3",
          },
        },
        null,
        2
      )
    )

    expect(__testables__.shouldUseNpmLegacyPeerDeps(baseDir)).toBe(false)
  })
})
