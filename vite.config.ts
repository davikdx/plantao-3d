import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" garante caminhos relativos dentro do WebView do Capacitor (sem server.url).
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    target: "es2020",
    outDir: "dist",
    sourcemap: false,
    chunkSizeWarningLimit: 1500
  }
});
