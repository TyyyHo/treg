import type { PackagePreset } from "../../types.ts"

export const nodePackagePresets: readonly PackagePreset[] = [
  {
    id: "express",
    label: "Express",
    description: "Minimal backend HTTP server for Node.js projects.",
    dependencies: ["express"],
    devDependencies: ["@types/express"],
    aiRule: {
      prompt: "Keep Express routes thin and move business logic into testable modules.",
      when: "When adding or changing backend HTTP routes.",
      checklist: [
        "Validate request input before route handlers use it.",
        "Return consistent error responses.",
        "Keep middleware ordering explicit and easy to audit.",
      ],
    },
  },
  {
    id: "fastify",
    label: "Fastify",
    description: "High-performance backend HTTP server for Node.js projects.",
    dependencies: ["fastify"],
    aiRule: {
      prompt: "Use Fastify plugins and schemas to keep backend routes structured.",
      when: "When adding Fastify routes, plugins, or server configuration.",
      checklist: [
        "Register plugins before dependent routes.",
        "Prefer route schemas for request and response contracts.",
        "Keep server startup separate from app construction for tests.",
      ],
    },
  },
  {
    id: "dotenv",
    label: "dotenv",
    description: "Environment variable loading for backend projects.",
    dependencies: ["dotenv"],
    aiRule: {
      prompt: "Load environment variables once at process startup and validate them before use.",
      when: "When adding configuration that depends on environment variables.",
      checklist: [
        "Avoid reading `process.env` throughout application code.",
        "Document required environment variables.",
        "Fail fast when required configuration is missing.",
      ],
    },
  },
  {
    id: "pino",
    label: "Pino",
    description: "Structured backend logging.",
    dependencies: ["pino"],
    aiRule: {
      prompt: "Use structured Pino logs with stable fields and no sensitive values.",
      when: "When adding backend logging or request diagnostics.",
      checklist: [
        "Log identifiers and state, not secrets or full payloads.",
        "Use consistent field names across request paths.",
        "Keep noisy debug logs behind environment-controlled levels.",
      ],
    },
  },
  {
    id: "prisma",
    label: "Prisma",
    description: "Database ORM and generated client.",
    dependencies: ["@prisma/client"],
    devDependencies: ["prisma"],
    aiRule: {
      prompt: "Keep Prisma access behind repository or service boundaries.",
      when: "When adding database models, migrations, or queries.",
      checklist: [
        "Prefer migrations over manual schema drift.",
        "Keep query selection narrow and intentional.",
        "Handle unique and relational constraint errors explicitly.",
      ],
    },
  },
]
