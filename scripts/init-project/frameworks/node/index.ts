export const nodeFramework = {
  id: "node",
  testEnvironment: "node",
  tsRequiredExcludes: ["dist", "coverage"],
  matches() {
    return true
  },
}
