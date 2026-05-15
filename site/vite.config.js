import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/wireshark-study-guide/',
  build: {
    outDir: '../docs',
    emptyOutDir: true,
  },
})
