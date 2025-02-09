import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: "/", // Ensure correct base path for deployment
  server: {
    historyApiFallback: true, // Serves index.html for unknown routes (fixes 404 issue)
  },
  build: {
    outDir: "dist",
  },
});
