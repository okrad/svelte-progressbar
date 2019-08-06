import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';
import buble from 'rollup-plugin-buble';
import pkg from './package.json';

export default {
	input: 'src/ProgressBar.svelte',
	output:[
		{ file: pkg.module, 'format': 'cjs' },
		// { file: pkg.module, 'format': 'es' },
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
		buble()
	],
};