import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  publicDir: false,
  build: {
    outDir: "dist-react",
    assetsDir: "assets",
    emptyOutDir: false,
    manifest: true,
    rollupOptions: {
      input: "index.html"
    }
  }
});
