#!/usr/bin/env node
import { main } from "./init-project/index.ts"

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
