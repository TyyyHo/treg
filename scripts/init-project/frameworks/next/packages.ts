import type { PackagePreset } from "../../types.ts"

export const nextPackagePresets: readonly PackagePreset[] = [
  {
    id: "tailwind",
    label: "Tailwind CSS",
    description: "Utility-first styling for Next.js applications.",
    dependencies: ["clsx"],
    devDependencies: ["tailwindcss"],
    aiRule: {
      prompt: "Use Tailwind utilities consistently and keep reusable UI patterns in components.",
      when: "When styling Next.js routes, layouts, or components.",
      checklist: [
        "Keep route layout styling separate from reusable component styling.",
        "Use the generated `cn` helper when composing conditional class names.",
        "Prefer Tailwind built-in utilities or project-defined class names, such as `min-w-37.5` instead of `min-w-[150px]`, and avoid one-off arbitrary values when a token or shared pattern fits.",
        "Check responsive class combinations for mobile and desktop.",
      ],
    },
  },
  {
    id: "zustand",
    label: "Zustand",
    description: "Client state store for Next.js client components.",
    dependencies: ["zustand"],
    aiRule: {
      prompt: "Use Zustand only inside client component boundaries for client-owned state.",
      when: "When Next.js UI state must be shared across client components.",
      checklist: [
        "Do not import Zustand stores into server components.",
        "Do not mirror server-fetched data in Zustand.",
        "Split stores by a single feature that can be described in one sentence to avoid cross-feature state coupling and meaningless re-renders.",
        "Before adding global state, verify the state cannot stay local to a page or feature module; prefer `useState` when it is enough.",
        "Keep store modules behind `use client` entry points when needed.",
      ],
    },
  },
  {
    id: "tanstack-query",
    label: "TanStack Query",
    description: "Client-side server-state cache for Next.js client components.",
    dependencies: ["@tanstack/react-query"],
    aiRule: {
      prompt:
        "Use TanStack Query for client-side server state and align it with Next.js data boundaries.",
      when: "When client components fetch, mutate, or refresh remote data.",
      checklist: [
        "Use stable query keys that include route params and filters.",
        "Avoid duplicating server component data fetching unnecessarily.",
        "Invalidate only the query keys affected by mutations.",
      ],
    },
  },
  {
    id: "i18n",
    label: "next-intl",
    description: "Internationalization for Next.js routing and rendering.",
    dependencies: ["next-intl"],
    aiRule: {
      prompt: "Use next-intl for localized routes, messages, and formatting.",
      when: "When adding user-facing text or locale-aware formatting in Next.js.",
      checklist: [
        "Keep messages organized by route or feature.",
        "Use locale-aware formatting helpers for dates and numbers.",
        "Avoid hard-coded user-facing strings in components.",
      ],
    },
  },
  {
    id: "next-auth",
    label: "NextAuth.js",
    description: "Authentication primitives for Next.js applications.",
    dependencies: ["next-auth"],
    aiRule: {
      prompt:
        "Keep NextAuth configuration centralized and treat session data as security-sensitive.",
      when: "When adding authentication, session access, or protected routes.",
      checklist: [
        "Keep provider secrets in environment configuration.",
        "Avoid exposing sensitive user fields in sessions.",
        "Check route protection on both server and client entry points.",
      ],
    },
  },
]
