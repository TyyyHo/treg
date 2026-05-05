import type { PackagePreset } from "../../types.ts"

export const nuxtPackagePresets: readonly PackagePreset[] = [
  {
    id: "tailwind",
    label: "Nuxt Tailwind",
    description: "Tailwind CSS module for Nuxt applications.",
    dependencies: ["clsx"],
    devDependencies: ["@nuxtjs/tailwindcss"],
    aiRule: {
      prompt:
        "Use the Nuxt Tailwind module and keep styling aligned with Nuxt layouts and components.",
      when: "When styling Nuxt pages, layouts, or components.",
      checklist: [
        "Configure the module through Nuxt config.",
        "Use the generated `cn` helper when composing conditional class names.",
        "Keep repeated class groups in reusable components.",
        "Prefer Tailwind built-in utilities or project-defined class names, such as `min-w-37.5` instead of `min-w-[150px]`, and avoid one-off arbitrary values when a token or shared pattern fits.",
        "Check generated UI across mobile and desktop layouts.",
      ],
    },
  },
  {
    id: "pinia",
    label: "Pinia for Nuxt",
    description: "Nuxt-integrated Pinia state management.",
    dependencies: ["@pinia/nuxt", "pinia"],
    aiRule: {
      prompt: "Use Pinia stores for shared Nuxt client state and keep SSR boundaries explicit.",
      when: "When Nuxt state must be shared across pages or components.",
      checklist: [
        "Avoid storing server response caches in Pinia without a clear reason.",
        "Keep store initialization SSR-safe.",
        "Use actions for state transitions.",
      ],
    },
  },
  {
    id: "tanstack-query",
    label: "TanStack Query",
    description: "Server-state cache for Vue/Nuxt client interactions.",
    dependencies: ["@tanstack/vue-query"],
    aiRule: {
      prompt:
        "Use TanStack Vue Query for client-side server state and align it with Nuxt data loading.",
      when: "When Nuxt client interactions fetch, mutate, or refresh remote data.",
      checklist: [
        "Use stable query keys that include route params and filters.",
        "Avoid duplicating data already loaded by Nuxt server data APIs.",
        "Keep mutation invalidation scoped to affected queries.",
      ],
    },
  },
  {
    id: "i18n",
    label: "Nuxt i18n",
    description: "Internationalization module for Nuxt applications.",
    dependencies: ["@nuxtjs/i18n"],
    aiRule: {
      prompt: "Use Nuxt i18n for localized routes, messages, and locale-aware rendering.",
      when: "When adding user-facing text or localized routes in Nuxt.",
      checklist: [
        "Keep locale messages organized by route or feature.",
        "Use locale-aware links and route helpers.",
        "Avoid hard-coded user-facing strings in components.",
      ],
    },
  },
  {
    id: "vueuse",
    label: "VueUse for Nuxt",
    description: "Nuxt module for VueUse composables.",
    dependencies: ["@vueuse/nuxt"],
    aiRule: {
      prompt: "Use VueUse composables through the Nuxt module for common reactive utilities.",
      when: "When adding browser APIs, sensors, storage, or reusable reactive helpers.",
      checklist: [
        "Check SSR safety before using browser-only APIs.",
        "Prefer module-provided auto imports when available.",
        "Keep custom composables focused and testable.",
      ],
    },
  },
]
