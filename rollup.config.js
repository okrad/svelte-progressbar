import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';
import serve from 'rollup-plugin-serve';
import autoPreprocess from 'svelte-preprocess';
import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';

const name = 'ProgressBar';

const devel = process.env.BUILD === 'dev';
const production = process.env.BUILD === 'production';

let input = 'src/ProgressBar.svelte';
let modExports = {};

function typeCheck() {
  return {
    writeBundle() {
      require('child_process').spawn('svelte-check', {
        stdio: ['ignore', 'inherit', 'inherit'],
        shell: true
      });
    }
  }
}


if(devel) {
	modExports = {
		input: input,
		output: [{
			file: 'public/main.js',
			format: 'umd',
			name: name,
			sourcemap: true
		}],
		plugins: [
			typeCheck(),
			svelte({
				preprocess: autoPreprocess(),
				emitCss: false
			}),
			typescript({ sourceMap: true }),
			resolve({browser: true}),
			commonjs(),
			replace({
				'outros.c.push': 'if (outros === undefined) { block.o(local); return }\noutros.c.push'
  			}),
			serve('public')
		]
	};
}
else {

	let output;

	output = [
		// { file: pkg.main, 'format': 'cjs' },
		// { file: pkg.main, 'format': 'iife', name }
		{ file: pkg.module, 'format': 'es', sourcemap: false },
		{ file: pkg.main, 'format': 'umd', name, sourcemap: false }
	];

	modExports = {
		input: input,
		output: output,
		plugins: [
			typeCheck(),
			svelte({
				preprocess: autoPreprocess(),
				emitCss: false
			}),
			typescript({ sourceMap: true }),
			resolve({
				browser: true,
				dedupe: ['svelte']
			}),
			commonjs(),
			production && terser(),
			replace({
				'outros.c.push': 'if (outros === undefined) { block.o(local); return }\noutros.c.push'
  			}),
		]
	};
}

export default modExports;