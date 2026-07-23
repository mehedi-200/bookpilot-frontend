import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

/**
 * Separate build for the embeddable widget: one self-contained IIFE file with
 * its CSS inlined, written to public/ so the dev server and the dashboard build
 * both serve it at /widget.js.
 */
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  // This build only emits widget.js; it must not try to copy public/ into itself.
  publicDir: false,
  build: {
    outDir: 'public',
    emptyOutDir: false, // public/ also holds the favicon and the embed test page
    lib: {
      entry: path.resolve(__dirname, 'src/widget/main.jsx'),
      name: 'BookPilotWidget',
      formats: ['iife'],
      fileName: () => 'widget.js',
    },
    rollupOptions: {
      output: {
        // Keep the CSS inside the single JS file — one <script> tag, no extras.
        inlineDynamicImports: true,
      },
    },
  },
})
