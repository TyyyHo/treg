import type { PackagePreset } from "../../types.ts"

export const vuePackagePresets: readonly PackagePreset[] = [
  {
    id: "tailwind",
    label: "Tailwind CSS",
    description: "Utility-first styling for Vue applications.",
    dependencies: ["clsx"],
    devDependencies: ["tailwindcss"],
    aiRule: {
      prompt: "Use Tailwind utilities consistently in Vue templates and extract repeated patterns.",
      when: "When styling Vue components.",
      checklist: [
        "Keep template class bindings readable.",
        "Use the generated `cn` helper when composing conditional class names.",
        "Extract repeated class groups into components or computed values.",
        "Check responsive classes across mobile and desktop layouts.",
      ],
    },
  },
  {
    id: "pinia",
    label: "Pinia",
    description: "State management for Vue applications.",
    dependencies: ["pinia"],
    aiRule: {
      prompt: "Use Pinia stores for shared client state and keep stores domain-focused.",
      when: "When Vue component state needs to be shared across routes or distant components.",
      checklist: [
        "Do not mirror server cache data in Pinia.",
        "Expose actions for state transitions.",
        "Keep stores small enough to test in isolation.",
      ],
    },
  },
  {
    id: "tanstack-query",
    label: "TanStack Query",
    description: "Server-state fetching and cache management for Vue.",
    dependencies: ["@tanstack/vue-query"],
    aiRule: {
      prompt: "Use TanStack Vue Query for server state and keep query keys stable.",
      when: "When fetching, caching, mutating, or invalidating remote data in Vue.",
      checklist: [
        "Use query keys that include every reactive data dependency.",
        "Keep mutation invalidation scoped to affected queries.",
        "Avoid copying query results into Pinia unless there is a clear UI-state reason.",
      ],
    },
  },
  {
    id: "i18n",
    label: "vue-i18n",
    description: "Internationalization for Vue applications.",
    dependencies: ["vue-i18n"],
    aiRule: {
      prompt: "Use vue-i18n translation keys instead of hard-coded user-facing strings.",
      when: "When adding text that appears in the Vue UI.",
      checklist: [
        "Keep translation keys stable and descriptive.",
        "Use interpolation for dynamic values.",
        "Keep locale messages organized by feature or view.",
      ],
    },
  },
  {
    id: "vueuse",
    label: "VueUse",
    description: "Composable Vue utilities.",
    dependencies: ["@vueuse/core"],
    aiRule: {
      prompt: "Use VueUse composables for common reactive browser and state utilities.",
      when: "When adding browser APIs, sensors, storage, or reusable reactive helpers.",
      checklist: [
        "Prefer existing VueUse composables over custom reactive wrappers.",
        "Check SSR safety before using browser-only APIs.",
        "Keep custom composables small and focused.",
      ],
    },
  },
]
