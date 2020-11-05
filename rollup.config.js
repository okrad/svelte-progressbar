import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';
import serve from 'rollup-plugin-serve';
import autoPreprocess from 'svelte-preprocess';
import typescript from '@rollup/plugin-typescript';

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
		}],
		plugins: [
			typeCheck(),
			svelte({
				preprocess: autoPreprocess()
			}),
			typescript({ sourceMap: false }),
			resolve({browser: true}),
			commonjs(),
			serve('public')
		]
	};
}
else {

	let output;

	output = [
		// { file: pkg.main, 'format': 'cjs' },
		// { file: pkg.main, 'format': 'iife', name }
		{ file: pkg.module, 'format': 'es' },
		{ file: pkg.main, 'format': 'umd', name }
	];

	modExports = {
		input: input,
		output: output,
		plugins: [
			typeCheck(),
			svelte({
				preprocess: autoPreprocess()
			}),
			typescript({ sourceMap: true }),
			resolve({browser: true}),
			commonjs(),
			production && terser()
		]
	};
}

export default modExports;