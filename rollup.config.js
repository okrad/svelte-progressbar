import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';
import buble from 'rollup-plugin-buble';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

const production = process.env.BUILD === 'production';

export default {
	input: 'src/ProgressBar.svelte',
	output:[
		{ file: pkg.main, 'format': 'cjs' },
		{ file: pkg.module, 'format': 'es' }
		// { file: pkg.main, 'format': 'umd', name }
	],
	plugins: [
		svelte({
			// we'll extract any component CSS out into
			// a separate file — better for performance
			css: css => {
				css.write('index.css');
			}
		}),
		resolve(),
		buble(),
		production && terser()
	]
};