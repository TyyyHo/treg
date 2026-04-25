import { commonPackagePresets } from "./common/packages.ts"
import { nextPackagePresets } from "./next/packages.ts"
import { nodePackagePresets } from "./node/packages.ts"
import { nuxtPackagePresets } from "./nuxt/packages.ts"
import { reactPackagePresets } from "./react/packages.ts"
import { sveltePackagePresets } from "./svelte/packages.ts"
import { vuePackagePresets } from "./vue/packages.ts"
import type { FrameworkId, PackagePreset, PackagePresetId } from "../types.ts"

const FRAMEWORK_PACKAGE_PRESETS: Record<FrameworkId, readonly PackagePreset[]> = {
  next: nextPackagePresets,
  node: nodePackagePresets,
  nuxt: nuxtPackagePresets,
  react: reactPackagePresets,
  svelte: sveltePackagePresets,
  vue: vuePackagePresets,
}

export function getPackagePresets(frameworkId: FrameworkId): PackagePreset[] {
  return [...commonPackagePresets, ...FRAMEWORK_PACKAGE_PRESETS[frameworkId]]
}

export function getSelectedPackagePresets(
  frameworkId: FrameworkId,
  selectedIds: readonly PackagePresetId[]
): PackagePreset[] {
  const selected = new Set(selectedIds)
  return getPackagePresets(frameworkId).filter((preset) => selected.has(preset.id))
}
