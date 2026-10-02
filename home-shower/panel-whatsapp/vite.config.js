import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/envios/",
  build: {
    outDir: "../envios",
    emptyOutDir: true
  },
  server: {
    host: "0.0.0.0",
    port: 5173
  }
});
