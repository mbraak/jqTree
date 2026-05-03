import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      'app': path.resolve(__dirname, '../src')
    },
  },
  test: {
    coverage: {
      exclude: ['src/playwright'],
      include: ['src/**'],
      provider: "istanbul",
      reporter: ["json"],
      reportsDirectory: "js-coverage"
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
