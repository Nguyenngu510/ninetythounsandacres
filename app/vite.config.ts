import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' để build ra dist chạy được cả khi deploy trong thư mục con (GitHub Pages)
export default defineConfig({
  plugins: [react()],
  base: './',
});
