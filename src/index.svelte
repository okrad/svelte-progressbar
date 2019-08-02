<script>
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { setContext } from 'svelte';
	import { derived } from 'svelte/store';
	import RadialProgressBar from './RadialProgressBar.svelte';
	import LinearProgressBar from './LinearProgressBar.svelte';

	export let style = 'default'; // [thin, radial]
	export let width = null;
	export let thickness = null;
	export let height = null;
	export let textSize = null;

	if(width == null)
		width = style == 'radial' ? 75 : 150;

	if(height == null)
		height = style == 'radial' ? width : 12 * width / 100;

	if(textSize == null)
		textSize = style == 'radial' ? 150 : style == 'thin' ? 60 : 70;

	export let colors = [
		'#FFC107',
		'#4CAF50',
		'#03A9F4'
	];

	export let series = [];

	const twOpts = {
		duration: 1000,
		easing: cubicOut
	};

	if(!Array.isArray(series))
		series = [series];

	series = series.map((s, idx) => {
		if(typeof s != 'object')
			s = {perc: s};

		s.offset = tweened(0, twOpts);
		s.prevOffset = tweened(0, twOpts);

		if(!s.color)
			s.color = colors[idx % colors.length];

		return s;
	});

	const valueStore = tweened(Array(series.length).fill(0), twOpts);
	const valStore = derived(
		valueStore,
		$valueStore => $valueStore.map(s => Math.round(s) + '%').join(' + ')
	);

	$: {
		valueStore.set(series.map(s => s.perc));

		let cumOffset = 0;
		series.forEach((s, idx) => {
			s.prevOffset.set(cumOffset);
			cumOffset += s.perc;
			s.offset.set(cumOffset);
		});
	}

	setContext('valStore', valStore);

	export function updatePerc(perc, seriesIdx = 0) {
		series[seriesIdx].perc = perc;
	}
</script>

{#if style == 'radial'}
	<RadialProgressBar {series} {thickness} {width} {height} {textSize} />
{:else}
	<LinearProgressBar {series} {style} {width} {height} {thickness} {textSize} />
{/if}