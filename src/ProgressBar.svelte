<svelte:options accessors={true}/>
<script lang="ts">
	// @ts-check
	import type {SeriesStore, Threshold} from './types';
	import { seriesStore } from './stores';

	import RadialProgressBar from './RadialProgressBar.svelte';
	import LinearProgressBar from './LinearProgressBar.svelte';
	import CustomShapeProgressBar from './CustomShapeProgressBar.svelte';

	export let series = [];
	export let style: string = 'default'; // [thin, radial , semicircle]
	export let thickness: number = style == 'radial' || style == 'semicircle' ? 5 : null;
	export let stackSeries: boolean = true;
	export let margin: number = 0;
	export let valueLabel: string = null;

	export let colors: Array<string> = [
		'#FFC107',
		'#4CAF50',
		'#03A9F4'
	];

	//Array of classes / colors that must be applied to the stops whenever the progress percent exceeds the threshold
	export let thresholds: Array<Threshold> = [];

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

	export function updateSeries(_series: []): void {
		series = _series;
	}
</script>
{#if style == 'radial' || style == 'semicircle'}
	<RadialProgressBar
		{...$$props}
		{store}
		{colors}
		{thresholds}>
		<slot></slot>
	</RadialProgressBar>
{:else if style == 'default' || style == 'thin'}
	<LinearProgressBar
		{...$$props}
		{store}/>
{:else if style == 'custom'}
	<CustomShapeProgressBar
		{...$$props}
		{store}/>
{/if}