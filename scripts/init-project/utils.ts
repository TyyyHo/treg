export function hasPackage(pkg, name) {
  return Boolean(
    pkg.dependencies?.[name] ||
    pkg.devDependencies?.[name] ||
    pkg.peerDependencies?.[name]
  )
}

export function formatStep(step, total, message, dryRun) {
  const suffix = dryRun ? " [dry-run]" : ""
  return `[${step}/${total}] ${message}${suffix}`
}
