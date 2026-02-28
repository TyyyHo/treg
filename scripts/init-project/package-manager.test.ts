import { mkdtemp, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { describe, expect, it } from "@jest/globals"
import { detectPackageManager } from "./package-manager.ts"

describe("detectPackageManager", () => {
  it("defaults to npm when no lockfile exists", async () => {
    const baseDir = await mkdtemp(path.join(os.tmpdir(), "treg-pm-"))
    expect(detectPackageManager(baseDir)).toBe("npm")
  })

  it("detects pnpm from lockfile", async () => {
    const baseDir = await mkdtemp(path.join(os.tmpdir(), "treg-pm-"))
    await writeFile(
      path.join(baseDir, "pnpm-lock.yaml"),
      "lockfileVersion: 9\n"
    )
    expect(detectPackageManager(baseDir)).toBe("pnpm")
  })
})
