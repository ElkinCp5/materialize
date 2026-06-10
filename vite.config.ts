import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  // ====================================================================
  // ENTRADA Y SALIDA
  // ====================================================================
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'src/index.ts'),
      },
      external: [],
    },
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'Materialize',
      formats: ['es', 'umd', 'iife'],
      fileName: (format) => {
        if (format === 'es') return 'materialize.es.js'
        if (format === 'umd') return 'materialize.js'
        if (format === 'iife') return 'materialize.iife.js'
        return 'materialize.js'
      },
    },
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,
  },

  // ====================================================================
  // DESARROLLO
  // ====================================================================
  server: {
    port: 5173,
    host: '127.0.0.1',
    open: true,
    cors: true,
  },

  preview: {
    port: 4173,
    host: '127.0.0.1',
    open: true,
  },

  // ====================================================================
  // RESOLUCIÓN
  // ====================================================================
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@utilities': path.resolve(__dirname, './src/utilities'),
      '@scss': path.resolve(__dirname, './sass'),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json', '.scss', '.css'],
  },

  // ====================================================================
  // IMPORTS Y CSS
  // ====================================================================
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "@scss/variables";
          @import "@scss/mixins";
        `,
      },
    },
    postcss: {
      plugins: [
        {
          postcssPlugin: 'internal:charset-removal',
          Once(root) {
            const atRules: any[] = []
            root.walkAtRules('charset', (rule) => {
              if (root.first !== rule) {
                atRules.push(rule)
              }
            })
            atRules.forEach((rule) => rule.remove())
          },
        },
      ],
    },
  },

  // ====================================================================
  // LOGGING
  // ====================================================================
  logLevel: 'info',

  // ====================================================================
  // CLEAR SCREEN
  // ====================================================================
  clearScreen: true,

  // ====================================================================
  // PLUGINS
  // ====================================================================
  plugins: [],

  // ====================================================================
  // OPTIMIZACIÓN
  // ====================================================================
  optimizeDeps: {
    include: [],
    exclude: ['node_modules'],
    esbuildOptions: {
      target: 'esnext',
    },
  },
})
