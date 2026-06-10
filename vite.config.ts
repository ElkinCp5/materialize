import { defineConfig } from 'vite'
import typescript from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  // ====================================================================
  // ENTRADA Y SALIDA
  // ====================================================================
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      format: {
        comments: false,
      },
    },
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'src/index.ts'),
      },
      output: [
        // ESM
        {
          file: 'dist/js/materialize.es.js',
          format: 'es',
          sourcemap: true,
        },
        // UMD
        {
          file: 'dist/js/materialize.js',
          format: 'umd',
          name: 'Materialize',
          sourcemap: true,
        },
        // IIFE
        {
          file: 'dist/js/materialize.iife.js',
          format: 'iife',
          name: 'Materialize',
          sourcemap: true,
        },
      ],
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
    https: false,
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
        api: 'modern-compiler',
      },
    },
    postcss: {
      plugins: [
        {
          postcssPlugin: 'internal:charset-removal',
          Once(root) {
            const atRules = []
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
