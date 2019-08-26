<script>
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { setContext } from 'svelte';
	import { derived } from 'svelte/store';
	import { readable } from 'svelte/store';
	import RadialProgressBar from './RadialProgressBar.svelte';
	import LinearProgressBar from './LinearProgressBar.svelte';

	export let style = 'default'; // [thin, radial]
	export let showProgressValue = true;
	export let width = null;
	export let thickness = null;
	export let height = null;
	export let textSize = null;
	export let forceContent = null;

	if(width == 'auto')
		width = '100%';

	export let colors = [];

	//Array of the classes that must be applied to the stops whenever the progress percent exceeds the threshold
	export let classByThresholds = [];

	if(classByThresholds.length > 0) {
		//Sort thresholds to ensure proper comparison
		classByThresholds.sort((t1, t2) => t1.threshold - t2.threshold);
	}
	else if(colors.length == 0) {
		colors = [
			'#FFC107',
			'#4CAF50',
			'#03A9F4'
		];
	}

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

		if(!s.color && colors)
			s.color = colors[idx % colors.length];

		return s;
	});

	const valueStore = tweened(Array(series.length).fill(0), twOpts);
	let valStore;
	if(!forceContent) {
		valStore = derived(
			valueStore,
			$valueStore => $valueStore.map(s => Math.round(s) + '%').join(' + ')
		);
	}
	else {
		valStore = readable(forceContent);
	}

	$: {
		valueStore.set(series.map(s => s.perc));

		let cumOffset = 0;
		series.forEach((s, idx) => {
			s.prevOffset.set(cumOffset);
			cumOffset += s.perc;
			s.offset.set(cumOffset);
			const appliedThreshold = classByThresholds.find((thresInfo, idx) => (s.perc <= thresInfo.threshold || idx == classByThresholds.length - 1));

			s.cls = appliedThreshold ? appliedThreshold.cls : null;
		});
	}

	setContext('valStore', valStore);

	export function updatePerc(perc, seriesIdx = 0) {
		series[seriesIdx].perc = perc;
	}
</script>

{#if style == 'radial'}
	<RadialProgressBar {series} {thickness} {width} {height} {textSize} {showProgressValue} />
{:else}
	<LinearProgressBar {series} {style} {width} {height} {textSize} {showProgressValue} />
{/if}