import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const isGitHubPages = process.env.GITHUB_PAGES === '1'

export default defineConfig({
  plugins: [react()],
  base: isGitHubPages ? '/wireshark-study-guide/' : '/',
  build: {
    outDir: '../docs',
    emptyOutDir: true,
  },
})
