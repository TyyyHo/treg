/** @type {import("jest").Config} */
const config = {
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  transform: {},
  testMatch: ["**/*.test.ts"],
}

module.exports = config
