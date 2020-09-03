<svelte:options accessors={true}/>
<script>
	import { seriesStore } from './stores.js';

	import RadialProgressBar from './RadialProgressBar.svelte';
	import LinearProgressBar from './LinearProgressBar.svelte';

	export let series = [];
	export let style = 'default'; // [thin, radial , semicircle]
	export let showProgressValue = true;
	export let width = null;
	export let thickness = null;
	export let height = null;
	export let textSize = null;
	export let stackSeries = true;
	export let margin = 0;
	export let addBackground = true;
	export let fillBackground = false;
	export let bgColor = '#e5e5e5';
	export let valueLabel = null;

	export let colors = [
		'#FFC107',
		'#4CAF50',
		'#03A9F4'
	];

	//Array of classes / colors that must be applied to the stops whenever the progress percent exceeds the threshold
	export let thresholds = [];
	if(thresholds.length > 0) {
		//Sort thresholds to ensure proper comparison
		thresholds.sort((t1, t2) => t1.threshold - t2.threshold);
	}

	if(width == 'auto')
		width = '100%';

	const store = seriesStore(series, {
		valueLabel,
		colors,
		thresholds,
		stackSeries,
		thickness,
		margin
	});

	$: store.updateSeries(series);
	$: {
		if(valueLabel != null)
			store.updateLabel(valueLabel);
	}

	export function updatePerc(perc, seriesIdx = 0) {

		if(!Array.isArray(series))
			series = [series];

		if(!series[seriesIdx] || typeof series[seriesIdx] != 'object') {
			series[seriesIdx] = {perc};
		}
		else {
			series[seriesIdx].perc = perc;
		}

	}
</script>

{#if style == 'radial'}
	<RadialProgressBar {store} {colors} {thresholds} {stackSeries} {addBackground} {fillBackground} {bgColor} {margin} {style} {thickness} {width} {height} {textSize} {showProgressValue} />
{:else if style == 'semicircle'}
	<RadialProgressBar {store} {colors} {thresholds} {stackSeries} {addBackground} {bgColor} {margin} {style} {thickness} {width} {height} {textSize} {showProgressValue} startAngle={-90} endAngle={90}/>
{:else}
	<LinearProgressBar {store} {colors} {thresholds} {stackSeries} {addBackground} {bgColor} {margin} {style} {thickness} {width} {height} {textSize} {showProgressValue} />
{/if}