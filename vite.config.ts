import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Code-based TanStack Router (no file-based route codegen) — simpler scaffold
// for a POC; doesn't change the resulting UI/URLs.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    // `tanstack-pagekit` is consumed via `link:../tanstack-pagekit` (pnpm
    // symlink, not published to a registry) and has its own
    // node_modules/react as a devDependency. Without deduping, Vite loads
    // two separate React module instances — one for this app, one for the
    // linked package — which breaks hooks (`Cannot read properties of null
    // (reading 'useId')` and similar "invalid hook call" errors).
    dedupe: ['react', 'react-dom'],
  },
})
