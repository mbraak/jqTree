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
    include: ['test/**/*.{test,spec}.?(c|m)[jt]s?(x)'],

    setupFiles: [
      "./test/support/setupTests.ts",
      "givens/setup.js",
      "jest-extended/all",
    ],
  },
});
