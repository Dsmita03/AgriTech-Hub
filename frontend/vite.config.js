import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  base: "/", // Ensures correct base path
  server: {
    historyApiFallback: true, // Fixes 404 on page reload
  },
});
