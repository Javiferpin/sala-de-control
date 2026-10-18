import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" hace que la web funcione en cualquier ruta (p. ej. usuario.github.io/sala-de-control/)
export default defineConfig({
  plugins: [react()],
  base: "./",
});
