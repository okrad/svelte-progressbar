<script>
	import { serieStore, valueStore } from './stores.js';
	import RadialProgressBar from './RadialProgressBar.svelte';
	import LinearProgressBar from './LinearProgressBar.svelte';

	export let style = 'default'; // [thin, radial]
	export let showProgressValue = true;
	export let width = null;
	export let thickness = null;
	export let height = null;
	export let textSize = null;
	export let forceContent = null;
	export let stackSeries = true;
	export let margin = 0;
	export let addBackground = true;
	export let bgColor = '#e5e5e5';

	if(width == 'auto')
		width = '100%';

	//Array of classes / colors that must be applied to the stops whenever the progress percent exceeds the threshold
	export let thresholds = [];

	if(thresholds.length > 0) {
		//Sort thresholds to ensure proper comparison
		thresholds.sort((t1, t2) => t1.threshold - t2.threshold);
	}

	export let colors = [];
	if(colors.length == 0) {
		colors = [
			'#FFC107',
			'#4CAF50',
			'#03A9F4'
		];
	}

	export let series = [];

	if(!Array.isArray(series))
		series = [series];

	series = series.map((s, idx) => {
		if(typeof s != 'object')
			s = {perc: s};

		if(!s.color) {
 			if(thresholds.length > 0 && thresholds[0].color) {
				s.color = thresholds[0].color;
			}
			else if(colors) {
				s.color = colors[idx % colors.length];
			}
		}

		s.store = serieStore(s, thresholds);

		return s;
	});

	const valStore = valueStore(Array(series.length).fill(0), forceContent);

	$: {
		$valStore = series.map(s => s.perc);

		let startOffset = 0;

		series.forEach((s, idx) => {

			s.store.setPerc(s.perc, startOffset);

			if(stackSeries)
				startOffset += s.perc;
		});
	}

	export function updatePerc(perc, seriesIdx = 0) {
		series[seriesIdx].perc = perc;
	}
</script>

{#if style == 'radial'}
	<RadialProgressBar {valStore} {series} {stackSeries} {addBackground} {bgColor} {margin} {style} {thickness} {width} {height} {textSize} {showProgressValue} />
{:else}
	<LinearProgressBar {valStore} {series} {style} {addBackground} {bgColor} {width} {height} {textSize} {showProgressValue} />
{/if}