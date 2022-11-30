///<reference types="@types/node"/>

import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact()],
  optimizeDeps: {
    include: [
      // "./node_modules/pyodide/distutils.tar",
      // "./node_modules/pyodide/pyodide.asm.wasm",
      // "./node_modules/pyodide/pyodide.asm.js",
      // "./node_modules/pyodide/pyodide.asm.data",
      // "./node_modules/pyodide/pyodide_py.tar",
      // "./node_modules/pyodide/pyodide.mjs",
      // "./node_modules/pyodide/pyodide.js",
      // "./node_modules/pyodide/repodata.json"
    ]
  },
  base: process.env.NODE_ENV == "production" ? "/python-web/" : undefined
})
