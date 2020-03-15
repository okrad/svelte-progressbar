import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';
import serve from 'rollup-plugin-serve';

const name = 'ProgressBar';

const devel = process.env.BUILD === 'dev';
const production = process.env.BUILD === 'production';
const legacy = !!process.env.LEGACY_BUILD;

let input = 'src/ProgressBar.svelte';
let modExports = {};

if(devel) {
	modExports = {
		input: input,
		output: [{
			file: 'public/main.js',
			format: 'umd',
			name: name,
		}],
		plugins: [
			svelte(),
			resolve({browser: true}),
			commonjs(),
			serve('public')
		]
	};
}
else {

	let output;

	if(legacy) {
		const nameParts = pkg.main.split('.');
		const fileName = nameParts[0] + '.legacy.' + nameParts[1];
		output = [
			{ file: fileName, 'format': 'umd', name }
		];

	}
	else {
		output = [
			// { file: pkg.main, 'format': 'cjs' },
			// { file: pkg.main, 'format': 'iife', name }
			{ file: pkg.module, 'format': 'es' },
			{ file: pkg.main, 'format': 'umd', name }
		];
	}

	modExports = {
		input: input,
		output: output,
		plugins: [
			svelte({
				// we'll extract any component CSS out into
				// a separate file — better for performance
				css: css => {
					css.write('index.css');
				}
			}),
			resolve({browser: true}),
			commonjs(),
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
}

export default modExports;