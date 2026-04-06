import type { Formatter } from "../types.ts"

export const FORMAT_IGNORE = [
  "node_modules",
  ".git",
  ".agents",
  ".claude",
  "dist",
  "build",
  "coverage",
  "*.log",
  ".env*",
  ".vercel",
  "pnpm-lock.yaml",
  "package-lock.json",
  "yarn.lock",
]

const PRETTIER_CONFIG = `{
  "semi": false,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
`

const OXFMT_CONFIG = `${JSON.stringify(
  {
    $schema: "./node_modules/oxfmt/configuration_schema.json",
    semi: false,
    trailingComma: "es5",
    lineWidth: 80,
    indentWidth: 2,
    useTabs: false,
    quotes: "double",
    ignorePatterns: FORMAT_IGNORE,
  },
  null,
  2
)}
`

export function getFormatterFiles(formatter: Formatter): {
  configPath: string
  configContent: string
  ignorePath: string | null
} {
  if (formatter === "oxfmt") {
    return {
      configPath: ".oxfmtrc.json",
      configContent: OXFMT_CONFIG,
      ignorePath: null,
    }
  }

  return {
    configPath: ".prettierrc.json",
    configContent: PRETTIER_CONFIG,
    ignorePath: ".prettierignore",
  }
}

export function getFormatterScripts(formatter: Formatter): {
  format: string
  formatCheck: string
} {
  if (formatter === "oxfmt") {
    return {
      format: "oxfmt .",
      formatCheck: "oxfmt . --check",
    }
  }

  return {
    format: "prettier --write .",
    formatCheck: "prettier --check .",
  }
}
