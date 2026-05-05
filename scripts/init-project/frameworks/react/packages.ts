import type { PackagePreset } from "../../types.ts"

export const reactPackagePresets: readonly PackagePreset[] = [
  {
    id: "tailwind",
    label: "Tailwind CSS",
    description: "Utility-first styling for React applications.",
    dependencies: ["clsx"],
    devDependencies: ["tailwindcss"],
    aiRule: {
      prompt:
        "Use Tailwind utilities consistently and extract repeated UI patterns into components.",
      when: "When styling React components or shared UI primitives.",
      checklist: [
        "Keep class lists readable and grouped by layout, spacing, color, and state.",
        "Use the generated `cn` helper when composing conditional class names.",
        "Avoid duplicating long class combinations across components.",
        "Prefer Tailwind built-in utilities or project-defined class names, such as `min-w-37.5` instead of `min-w-[150px]`, and avoid one-off arbitrary values when a token or shared pattern fits.",
      ],
    },
  },
  {
    id: "zustand",
    label: "Zustand",
    description: "Small client state store for React applications.",
    dependencies: ["zustand"],
    aiRule: {
      prompt: "Use Zustand for client-only state that is shared across distant React components.",
      when: "When local component state or context becomes awkward for UI state.",
      checklist: [
        "Do not mirror server cache data in Zustand.",
        "Split stores by a single feature that can be described in one sentence to avoid cross-feature state coupling and meaningless re-renders.",
        "Before adding global state, verify the state cannot stay local to a page or feature module; prefer `useState` when it is enough.",
        "Expose actions from the store instead of mutating state directly.",
      ],
    },
  },
  {
    id: "redux",
    label: "Redux Toolkit",
    description: "Predictable state management for larger React applications.",
    dependencies: ["@reduxjs/toolkit", "react-redux"],
    aiRule: {
      prompt:
        "Use Redux Toolkit for shared app state that benefits from explicit actions and reducers.",
      when: "When React state spans multiple domains, needs middleware, or requires predictable debugging.",
      checklist: [
        "Prefer `createSlice` and RTK patterns over handwritten Redux boilerplate.",
        "Keep server cache data in TanStack Query instead of Redux unless there is a clear reason.",
        "Expose typed hooks for dispatch and selector usage.",
      ],
    },
  },
  {
    id: "tanstack-query",
    label: "TanStack Query",
    description: "Server-state fetching and cache management for React.",
    dependencies: ["@tanstack/react-query"],
    aiRule: {
      prompt: "Use TanStack Query for server state and keep cache keys stable.",
      when: "When fetching, caching, mutating, or invalidating remote data.",
      checklist: [
        "Use structured query keys that include every data dependency.",
        "Keep mutation invalidation scoped to affected queries.",
        "Avoid storing query results in separate client state stores.",
      ],
    },
  },
  {
    id: "react-router",
    label: "React Router",
    description: "Routing primitives for React applications.",
    dependencies: ["react-router-dom"],
    aiRule: {
      prompt:
        "Use React Router route definitions and navigation APIs instead of hard-coded navigation state.",
      when: "When adding React routes, nested layouts, navigation links, or route params.",
      checklist: [
        "Keep route path constants or definitions centralized enough to avoid string drift.",
        "Use router APIs for navigation and params instead of manual URL parsing.",
        "Keep route-level loading and error states consistent.",
      ],
    },
  },
  {
    id: "tanstack-router",
    label: "TanStack Router",
    description: "Type-safe routing for React applications.",
    dependencies: ["@tanstack/react-router"],
    aiRule: {
      prompt:
        "Use TanStack Router route definitions as the source of truth for route params and loaders.",
      when: "When adding React routes, route params, or route-level data loading.",
      checklist: [
        "Keep route params typed through router APIs.",
        "Place route-level data dependencies in loaders when appropriate.",
        "Avoid duplicating route path strings outside route definitions.",
      ],
    },
  },
  {
    id: "i18n",
    label: "i18next + react-i18next",
    description: "Internationalization for React applications.",
    dependencies: ["i18next", "react-i18next"],
    aiRule: {
      prompt: "Use react-i18next translation keys instead of hard-coded user-facing strings.",
      when: "When adding text that appears in the React UI.",
      checklist: [
        "Keep translation keys stable and descriptive.",
        "Use interpolation instead of string concatenation.",
        "Keep locale files organized by feature or screen.",
      ],
    },
  },
  {
    id: "react-hook-form",
    label: "React Hook Form",
    description: "Form state and validation wiring for React.",
    dependencies: ["react-hook-form"],
    aiRule: {
      prompt:
        "Use React Hook Form to keep forms controlled by form state instead of scattered component state.",
      when: "When building non-trivial React forms.",
      checklist: [
        "Keep field names stable and typed where possible.",
        "Place validation near schema or form setup.",
        "Avoid duplicating form values into independent state.",
      ],
    },
  },
]
