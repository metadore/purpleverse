import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('@mediapipe')) return 'mediapipe';
          if (id.includes('@rive-app')) return 'rive';
          if (id.includes('/three/')) return 'three';
          if (id.includes('gsap')) return 'gsap';
          if (id.includes('react')) return 'react';
        }
      }
    }
  }
});
