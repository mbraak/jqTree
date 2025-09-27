import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      exclude: ['src/playwright'],
      include: ['src/**'],
      provider: "istanbul",
      reporter: ["lcov", "text"],
      reportsDirectory: "jest-coverage"
    },
    environment: "jsdom",
    globals: true,
    include: ['src/test/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    setupFiles: [
      "./src/test/support/setupTests.ts",
      "givens/setup.js",
      "jest-extended/all",
    ],
  },
});
