import type { FrameworkId } from "../types.ts"

const TS_REQUIRED_OPTIONS = {
  strict: true,
  strictNullChecks: true,
  noImplicitAny: true,
  noImplicitThis: true,
  exactOptionalPropertyTypes: true,
  noUncheckedIndexedAccess: true,
  noUnusedLocals: true,
  noUnusedParameters: true,
}

export function normalizeTypesValue(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((entry): entry is string => typeof entry === "string")
}

export function shouldIncludeNodeTypes(frameworkId: FrameworkId): boolean {
  return frameworkId === "node"
}

function hasReferencePath(value: unknown): value is { path: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "path" in value &&
    typeof (value as { path?: unknown }).path === "string"
  )
}

export function isSolutionStyleTsconfig(files: unknown, references: unknown): boolean {
  if (!Array.isArray(files) || files.length !== 0) {
    return false
  }
  if (!Array.isArray(references) || references.length === 0) {
    return false
  }

  return references.every(hasReferencePath)
}

export interface TsconfigTarget {
  path: string
  includeNodeTypes: boolean
}

function normalizeReferencePath(referencePath: string): string {
  return referencePath.replace(/\\/g, "/")
}

export function resolveTsconfigTargets(
  frameworkId: FrameworkId,
  _files: unknown,
  references: unknown
): TsconfigTarget[] {
  if (!Array.isArray(references) || !references.every(hasReferencePath)) {
    return [
      {
        path: "tsconfig.json",
        includeNodeTypes: shouldIncludeNodeTypes(frameworkId),
      },
    ]
  }

  const targets: TsconfigTarget[] = []
  const seenPaths = new Set<string>()
  const typedReferences = references as Array<{ path: string }>

  for (const reference of typedReferences) {
    const referencePath = normalizeReferencePath(reference.path)

    if (referencePath.endsWith("tsconfig.node.json")) {
      if (!seenPaths.has(referencePath)) {
        targets.push({ path: reference.path, includeNodeTypes: true })
        seenPaths.add(referencePath)
      }
      continue
    }

    if (referencePath.endsWith("tsconfig.app.json")) {
      if (!seenPaths.has(referencePath)) {
        targets.push({ path: reference.path, includeNodeTypes: false })
        seenPaths.add(referencePath)
      }
    }
  }

  return targets
}

export function mergeCompilerOptions(
  compilerOptions: Record<string, unknown>,
  includeNodeTypes: boolean
): Record<string, unknown> {
  if (!includeNodeTypes) {
    return {
      ...compilerOptions,
      ...TS_REQUIRED_OPTIONS,
    }
  }

  const types = new Set([...normalizeTypesValue(compilerOptions.types), "node"])

  return {
    ...compilerOptions,
    ...TS_REQUIRED_OPTIONS,
    types: Array.from(types),
  }
}
