import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "client",
  // .env.local lives at the repo root (vercel env pull writes it there).
  envDir: "..",
  plugins: [react()],
  build: { outDir: "../dist", emptyOutDir: true },
});
