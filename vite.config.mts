import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import { visualizer } from "rollup-plugin-visualizer";

const analyze = process.env.ANALYZE === "true";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    analyze &&
      visualizer({
        filename: "dist-react/stats.html",
        gzipSize: true,
        brotliSize: true,
        template: "treemap"
      })
  ],
  publicDir: false,
  preview: {
    allowedHosts: ["5600g.taild2025.ts.net"]
  },
  build: {
    outDir: "dist-react",
    assetsDir: "assets",
    emptyOutDir: false,
    manifest: true,
    // Mermaid is lazy-loaded for article diagrams, but its parser chunk is just over Vite's 500 kB default.
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      input: "index.html",
      output: {
        manualChunks(id: string) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("node_modules/react") || id.includes("node_modules/react-dom") || id.includes("node_modules/wouter")) return "react-vendor";
          return undefined;
        }
      }
    }
  }
});
