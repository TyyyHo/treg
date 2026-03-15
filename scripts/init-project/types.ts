export type CommandName = "init" | "add" | "list"

export type PackageManager = "pnpm" | "npm" | "yarn"
export type PackageManagerOption = PackageManager | "auto"

export type FrameworkId = "node" | "react" | "next" | "vue" | "svelte" | "nuxt"
export type Formatter = "prettier" | "oxfmt"

export type FeatureName = "lint" | "format" | "typescript" | "test" | "husky"
export type TestRunner = "jest" | "vitest"
export type TestEnvironment = "node" | "jsdom"

export interface PackageJson {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  peerDependencies?: Record<string, string>
  optionalDependencies?: Record<string, string>
  [key: string]: unknown
}

export interface Framework {
  id: FrameworkId
  testEnvironment: TestEnvironment
  tsRequiredExcludes: string[]
}

export interface DetectableFramework extends Framework {
  matches: (packageJson: PackageJson) => boolean
}

export interface EnabledFeatures {
  lint: boolean
  format: boolean
  typescript: boolean
  test: boolean
  husky: boolean
}

export interface ParsedOptions {
  command: CommandName
  projectDir: string | null
  framework: FrameworkId | null
  formatter: Formatter
  features: FeatureName[]
  testRunner: TestRunner | null
  pm: PackageManagerOption | null
  force: boolean
  dryRun: boolean
  noFormat: boolean
  noTestRunner: boolean
  skipHuskyInstall: boolean
  skills: boolean
  help: boolean
}

export interface RuleContext extends Omit<
  ParsedOptions,
  "projectDir" | "framework" | "pm" | "testRunner"
> {
  projectDir: string
  framework: Framework
  pm: PackageManager
  testRunner: TestRunner
  enabledFeatures: EnabledFeatures
}
