import { mkdtemp, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { describe, expect, it } from "@jest/globals"
import { filterUninstalledPackages } from "./shared.mjs"

describe("filterUninstalledPackages", () => {
  it("returns all packages when package.json is missing", async () => {
    const projectDir = await mkdtemp(path.join(os.tmpdir(), "treg-shared-"))
    const result = filterUninstalledPackages(projectDir, ["eslint", "jest"])
    expect(result).toEqual(["eslint", "jest"])
  })

  it("filters packages that are already declared", async () => {
    const projectDir = await mkdtemp(path.join(os.tmpdir(), "treg-shared-"))
    await writeFile(
      path.join(projectDir, "package.json"),
      JSON.stringify({
        dependencies: { react: "^19.0.0" },
        devDependencies: { eslint: "^9.0.0" },
        peerDependencies: { typescript: "^5.0.0" },
        optionalDependencies: { prettier: "^3.0.0" },
      })
    )

    const result = filterUninstalledPackages(projectDir, [
      "react",
      "eslint",
      "typescript",
      "prettier",
      "vitest",
    ])
    expect(result).toEqual(["vitest"])
  })

  it("parses scoped and versioned package specs", async () => {
    const projectDir = await mkdtemp(path.join(os.tmpdir(), "treg-shared-"))
    await writeFile(
      path.join(projectDir, "package.json"),
      JSON.stringify({
        devDependencies: {
          "@testing-library/jest-dom": "^6.0.0",
          "eslint-plugin-react": "^7.0.0",
        },
      })
    )

    const result = filterUninstalledPackages(projectDir, [
      "@testing-library/jest-dom@^6.6.3",
      "eslint-plugin-react@^7.37.5",
      "vitest@^3.2.4",
    ])
    expect(result).toEqual(["vitest@^3.2.4"])
  })
})
