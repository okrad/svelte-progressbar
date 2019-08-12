import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';
import pkg from './package.json';
import { terser } from 'rollup-plugin-terser';

const name = 'ProgressBar';
const production = process.env.BUILD === 'production';

export default {
	input: 'src/index.svelte',
	output:[
		{ file: pkg.module, 'format': 'es' },
		{ file: pkg.main, 'format': 'umd', name }
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
		production && terser()
	],
};