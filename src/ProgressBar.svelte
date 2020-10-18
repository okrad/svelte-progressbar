<svelte:options accessors={true}/>
<script lang="ts">
	// @ts-check
	import type {SeriesStore, Threshold} from './types';
	import { seriesStore } from './stores';

	import RadialProgressBar from './RadialProgressBar.svelte';
	import LinearProgressBar from './LinearProgressBar.svelte';

	export let series = [];
	export let style: string = 'default'; // [thin, radial , semicircle]
	export let showProgressValue: boolean = true;
	export let width: number = null;
	export let thickness: number = null;
	export let height: number = null;
	export let textSize: number = null;
	export let stackSeries: boolean = true;
	export let margin: number = 0;
	export let addBackground: boolean = true;
	export let bgFillColor: string = 'transparent';
	export let bgColor: string = '#e5e5e5';
	export let labelColor: string = '#555';
	export let valueLabel: string = null;
	export let cls: string = '';
	export let rx: number = 2;
	export let ry: number = null;

	if(ry == null)
		ry = rx;

	export let colors: Array<string> = [
		'#FFC107',
		'#4CAF50',
		'#03A9F4'
	];

	//Array of classes / colors that must be applied to the stops whenever the progress percent exceeds the threshold
	export let thresholds: Array<Threshold> = [];
	if(thresholds.length > 0) {
		//Sort thresholds to ensure proper comparison
		thresholds.sort((t1, t2) => t1.till - t2.till);
	}

	const store: SeriesStore = seriesStore(series, {
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

	export function updatePerc(perc: number, seriesIdx: number = 0): void {

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

<style>
	:global(.progress-value) {
		/* Fix for Safari positioning bug of foreignObject */
		/* See https://bugs.webkit.org/show_bug.cgi?id=23113 */
		position: fixed;
	}
</style>

{#if style == 'radial'}
	<RadialProgressBar
		{store}
		{colors}
		{thresholds}
		{stackSeries}
		{addBackground}
		{bgColor}
		{bgFillColor}
		{labelColor}
		{margin}
		{style}
		{thickness}
		{width}
		{height}
		{textSize}
		{cls}
		{showProgressValue}>
		<slot></slot>
	</RadialProgressBar>
{:else if style == 'semicircle'}
	<RadialProgressBar
		{store}
		{colors}
		{thresholds}
		{stackSeries}
		{addBackground}
		{bgColor}
		{bgFillColor}
		{labelColor}
		{margin}
		{style}
		{thickness}
		{width}
		{height}
		{textSize}
		{cls}
		{showProgressValue}
		startAngle={-90}
		endAngle={90}>
		<slot></slot>
	</RadialProgressBar>
{:else}
	<LinearProgressBar
		{store}
		{addBackground}
		{bgColor}
		{labelColor}
		{style}
		{width}
		{height}
		{textSize}
		{cls}
		{showProgressValue}
		{rx}
		{ry}/>
{/if}