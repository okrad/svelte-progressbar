import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

const name = 'ProgressBar';
const production = process.env.BUILD === 'production';
const legacy = !!process.env.LEGACY_BUILD;

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
		legacy && babel({
			extensions: [ '.js', '.mjs', '.html', '.svelte' ],
			runtimeHelpers: true,
			exclude: [ 'node_modules/@babel/**', 'node_modules/core-js/**' ],
			presets: [
				[
					'@babel/preset-env',
					{
						targets: '> 0.25%, not dead',
						useBuiltIns: 'usage',
  						corejs: 3
					}
				]
			],
			plugins: [
				'@babel/plugin-syntax-dynamic-import',
				[
					'@babel/plugin-transform-runtime',
					{
						useESModules: true
					}
				]
			]
		}),
		production && terser()
	]
};