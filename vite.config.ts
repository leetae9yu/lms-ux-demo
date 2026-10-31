import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/lms-ux-demo/",
  plugins: [react()],
});
