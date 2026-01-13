// Copy from Part 1
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    minify: 'esbuild'
  },
  esbuild: {
    target: 'es2020'
  }
})
