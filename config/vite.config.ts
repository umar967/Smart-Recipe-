import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig(() => {
  const root = path.resolve(__dirname, "..");

  return {
    root,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(root, "typescript"),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== "true",
      watch: process.env.DISABLE_HMR === "true" ? null : {},
    },
  };
});
