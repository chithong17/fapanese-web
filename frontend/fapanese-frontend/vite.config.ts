import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 1. PROXY CHO BACKEND JAVA (Business Logic)
      // Frontend gọi: /api/users -> http://localhost:8080/fapanese/users
      "/api": {
        // target: "https://5180368dcd09.ngrok-free.app/fapanese",
        target: "http://localhost:8080/fapanese", 
        changeOrigin: true,
        // Sửa lỗi: Chỉ trả về chuỗi đã thay thế
        rewrite: (path) => path.replace(/^\/api/, ""), 
      },
    },
  },
});
