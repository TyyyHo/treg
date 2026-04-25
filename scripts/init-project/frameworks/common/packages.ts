import type { PackagePreset } from "../../types.ts"

export const commonPackagePresets: readonly PackagePreset[] = [
  {
    id: "zod",
    label: "Zod",
    description: "Schema validation and typed parsing for external input.",
    dependencies: ["zod"],
    aiRule: {
      prompt: "Use Zod at trust boundaries and keep inferred types close to schemas.",
      when: "When validating request data, environment values, form payloads, or API responses.",
      checklist: [
        "Define schemas before consuming untrusted values.",
        "Use `safeParse` for recoverable validation paths.",
        "Export inferred types only when they reduce duplicate interface definitions.",
      ],
    },
  },
  {
    id: "date-fns",
    label: "date-fns",
    description: "Small date utilities with tree-shakable imports.",
    dependencies: ["date-fns"],
    aiRule: {
      prompt: "Use date-fns helpers instead of ad-hoc date math.",
      when: "When formatting, comparing, or calculating dates.",
      checklist: [
        "Import only the helpers that are used.",
        "Keep timezone-sensitive logic explicit.",
        "Avoid mutating `Date` instances in shared helpers.",
      ],
    },
  },
]
