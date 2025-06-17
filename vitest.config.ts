import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts", // Assuming vitest.setup.ts is at the root
    css: true,
    include: ["test/**/*.{test,spec}.{ts,tsx}"], // <--- MODIFIED: Look in the root "test" folder
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.{ts,tsx}"], // Coverage still targets your src files
      exclude: [
        "src/env.js",
        "src/types/**/*",
        "src/data/static-data/**/*",
        "**/*.config.{js,ts}",
        "**/*.d.ts",
        "src/app/api/auth/**/*",
      ],
    },
    alias: {
      "@/components": new URL("./src/components", import.meta.url).pathname,
      "@/lib": new URL("./src/lib", import.meta.url).pathname,
      "@/hooks": new URL("./src/hooks", import.meta.url).pathname,
      "@/data": new URL("./src/data", import.meta.url).pathname,
      "@/env": new URL("./src/env.js", import.meta.url).pathname,
      "@/styles": new URL("./src/styles", import.meta.url).pathname,
      "@/app": new URL("./src/app", import.meta.url).pathname,
      "@/server": new URL("./src/server", import.meta.url).pathname,
      "@/utils": new URL("./src/utils", import.meta.url).pathname,
    },
  },
});
