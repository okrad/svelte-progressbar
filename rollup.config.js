import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import pkg from './package.json';

const name = 'ProgressBar';

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
		babel({
			exclude: 'node_modules/**'
		}),
	],
};