import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import pkg from './package.json';

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
        entry: 'src/ProgressBar.svelte',
        name: 'ProgressBar',
        formats: ['es', 'umd'],
        fileName: (format) => {
          if(format == 'es')
            return pkg.module;
          else
            return pkg.main;
          // 'ProgressBar.js'
        }
      },
      watch: mode == 'development' ? {} : null,
      minify: mode != 'development'
    }
  }
})
