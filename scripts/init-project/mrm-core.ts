import { createRequire } from "node:module"

const require = createRequire(import.meta.url)

export const { file, json, lines, packageJson, install } = require("mrm-core")
