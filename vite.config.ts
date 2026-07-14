/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Serve assets under the repo subpath when deployed to GitHub Pages.
  // Uses '/' locally (dev/preview) so the app still works at the root.
  base: process.env.GITHUB_ACTIONS ? '/markdown-comparison/' : '/',
  // Vitest config: run component tests in a jsdom (browser-like) environment
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
})
