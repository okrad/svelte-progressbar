<svelte:options accessors={true}/>
<script lang="ts">
	// @ts-check
	import type {SeriesStore, Threshold} from './types';
	import { seriesStore } from './stores';

	import RadialProgressBar from './RadialProgressBar.svelte';
	import LinearProgressBar from './LinearProgressBar.svelte';
	import CustomShapeProgressBar from './CustomShapeProgressBar.svelte';

	export let series = [];
	export let style: string = 'default'; // [radial , semicircle]
	export let thickness: number = style == 'radial' || style == 'semicircle' ? 5 : null;
	export let stackSeries: boolean = true;
	export let margin: number = 0;
	export let valueLabel: string = null;
	export let width: number | string = '100%';

	export let colors: Array<string> = [
		'#FFC107',
		'#4CAF50',
		'#03A9F4'
	];

	//Array of classes / colors that must be applied to the stops whenever the progress percent exceeds the threshold
	export let thresholds: Array<Threshold> = [];

	if(width == 'auto')
		width = '100%';

	let actWidth = 0;

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
		store.updatePerc(perc, seriesIdx);
	}

	export function updateSeries(_series: []): void {
		series = _series;
	}
</script>

<div bind:clientWidth={actWidth} class="pb_cnt" style="width:{typeof width == 'string' ? width : width + 'px'}">
	{#if style == 'radial' || style == 'semicircle'}
		<RadialProgressBar
			{...$$props}
			{store}
			{colors}
			{thresholds}
			{actWidth}>
			<slot></slot>
		</RadialProgressBar>
	{:else if style == 'custom'}
		<CustomShapeProgressBar
			{...$$props}
			{store}
			{actWidth}
			/>
	{:else}
		<LinearProgressBar
			{...$$props}
			{store}
			{actWidth}
			/>
	{/if}
</div>