import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  return {
    plugins: [
      svelte({
				emitCss: false
      })
    ],
    build: {
      lib: {
        entry: 'src/lib/ProgressBar.svelte',
        name: 'ProgressBar',
        formats: ['es', 'umd'],
        fileName: (format) => {
          if(format == 'es')
            return 'index.mjs';
          else
            return 'index.js';
        }
      },
      watch: mode == 'development' ? {} : null,
      minify: mode != 'development'
    }
  }
})
