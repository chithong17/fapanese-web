import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        // target: "https://c49fed29a856.ngrok-free.app/fapanese",
<<<<<<< HEAD
        target: "http://localhost:8080/fapanese",
=======
      target: "http://localhost:8080/fapanese",
>>>>>>> 28f50e3b8afeb4455b44550e265f191680c4d48d
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
