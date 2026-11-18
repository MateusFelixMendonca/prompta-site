import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// Site estático (GitHub Pages): base relativa para funcionar no domínio próprio e no endereço do GitHub.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        kit: path.resolve(__dirname, 'prompo-constroe/index.html'),
      },
    },
  },
});
