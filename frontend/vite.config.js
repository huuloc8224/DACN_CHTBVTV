// frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', 
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), 
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'], 
  },
  server: {
    port: 5173,
    
    // [THÊM CẤU HÌNH PROXY NÀY]
    proxy: {
      // Bất kỳ yêu cầu nào bắt đầu bằng /uploads (ví dụ: /uploads/general/img.jpg)
      '/uploads': {
        target: 'http://localhost:3001', // Sẽ được chuyển đến Backend
        changeOrigin: true, // Cần thiết cho máy chủ ảo
      },
      // (Tùy chọn) Bạn cũng có thể proxy API để đơn giản hóa
      '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
      }
    }
  }
});

