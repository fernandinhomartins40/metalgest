import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@metalgest/shared": path.resolve(__dirname, "../../packages/shared"),
      "@metalgest/database": path.resolve(__dirname, "../../packages/database"),
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  optimizeDeps: {
    exclude: ["@metalgest/shared", "@metalgest/database"],
  },
});