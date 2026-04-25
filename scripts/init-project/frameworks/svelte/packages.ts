import type { PackagePreset } from "../../types.ts"

export const sveltePackagePresets: readonly PackagePreset[] = [
  {
    id: "tailwind",
    label: "Tailwind CSS",
    description: "Utility-first styling for Svelte applications.",
    dependencies: ["clsx"],
    devDependencies: ["tailwindcss"],
    aiRule: {
      prompt:
        "Use Tailwind utilities consistently in Svelte components and extract repeated patterns.",
      when: "When styling Svelte components or routes.",
      checklist: [
        "Keep class directives and class strings readable.",
        "Use the generated `cn` helper when composing conditional class names.",
        "Extract repeated class groups into components.",
        "Check responsive classes across mobile and desktop layouts.",
      ],
    },
  },
  {
    id: "tanstack-query",
    label: "TanStack Query",
    description: "Server-state fetching and cache management for Svelte.",
    dependencies: ["@tanstack/svelte-query"],
    aiRule: {
      prompt: "Use TanStack Svelte Query for server state and keep query keys stable.",
      when: "When fetching, caching, mutating, or invalidating remote data in Svelte.",
      checklist: [
        "Use structured query keys that include every data dependency.",
        "Keep mutation invalidation scoped to affected queries.",
        "Avoid duplicating query results into independent stores.",
      ],
    },
  },
  {
    id: "i18n",
    label: "svelte-i18n",
    description: "Internationalization for Svelte applications.",
    dependencies: ["svelte-i18n"],
    aiRule: {
      prompt: "Use svelte-i18n dictionaries instead of hard-coded user-facing strings.",
      when: "When adding text that appears in the Svelte UI.",
      checklist: [
        "Keep translation keys stable and descriptive.",
        "Use interpolation for dynamic values.",
        "Initialize locale loading before rendering localized content.",
      ],
    },
  },
  {
    id: "forms",
    label: "Felte",
    description: "Form state and validation helper for Svelte.",
    dependencies: ["felte"],
    aiRule: {
      prompt: "Use Felte to keep Svelte form state and validation flows explicit.",
      when: "When building non-trivial Svelte forms.",
      checklist: [
        "Keep form validation close to form setup.",
        "Avoid duplicating form values into unrelated stores.",
        "Handle submission and validation errors consistently.",
      ],
    },
  },
  {
    id: "adapter-node",
    label: "SvelteKit Node adapter",
    description: "Node.js deployment adapter for SvelteKit projects.",
    devDependencies: ["@sveltejs/adapter-node"],
    aiRule: {
      prompt: "Use the SvelteKit Node adapter when targeting Node.js deployment.",
      when: "When configuring SvelteKit builds for Node.js hosting.",
      checklist: [
        "Keep adapter configuration in `svelte.config.js`.",
        "Confirm runtime environment variables are documented.",
        "Verify build output before deployment changes.",
      ],
    },
  },
]
