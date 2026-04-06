import type { PackageJson } from "./types.ts"

export function hasPackage(pkg: PackageJson, name: string): boolean {
  return Boolean(
    pkg.dependencies?.[name] || pkg.devDependencies?.[name] || pkg.peerDependencies?.[name]
  )
}

export function formatStep(step: number, total: number, message: string, dryRun: boolean): string {
  const suffix = dryRun ? " [dry-run]" : ""
  return `[${step}/${total}] ${message}${suffix}`
}
