<script lang="ts">
	// @ts-check
	import Arc from './Arc.svelte';
	import SeriesArc from './SeriesArc.svelte';
	import type { SeriesStore, Threshold } from './types';
	import { seriesStore } from './stores';

	export let thickness: number = 5;
	export let width: number = null;
	export let height: number = null;
	export let textSize: number = null;
	export let showProgressValue: boolean = true;
	export let stackSeries: boolean = true;
	export let margin: number = 0;
	export let addBackground: boolean = true;
	export let bgColor: string = '#e5e5e5';
	export let bgFillColor: string = 'transparent';
	export let labelColor: string = '#555';
	export let startAngle: number = 0;
	export let endAngle: number = 360;
	export let colors: Array<string>;
	export let thresholds: Array<Threshold>;
	export let store: SeriesStore;
	export let style: string;
	export let cls: string = '';

	const ts = new Date().getTime();
	const maskId = 'tx_mask_' + ts + Math.floor(Math.random() * 999);

	if(width == null) {
		//Default width when not specified
		width = 75;
	}

	if(height == null) {
		//Default height when not specified
		height = (endAngle - startAngle) > 180 ? 100 : 50;
	}

	if(textSize == null)
		textSize = 150;

	const maskSeries = [{
		perc: $store.overallPerc,
		radius: 50 - (thickness * $store.series.length),
		color: '#fff'
	}];

	const maskStore = seriesStore(maskSeries, {colors, thresholds, stackSeries: false, thickness, margin});

	//Workaround to allow typescript check in the following "each" block
	//see https://github.com/sveltejs/language-tools/issues/493
	let storeValue: SeriesStore;

	$: storeValue = $store;

</script>

<style>
	.progress-value {
		/* Fix for Safari positioning bug of foreignObject */
		/* See https://bugs.webkit.org/show_bug.cgi?id=23113 */
		position: fixed;
	}
	.progress-value-inverted {
		fill: #fff;
	}

	.progress-value-content {
		position:absolute;
		top:0;
		left:0;
		right:0;
		bottom:0;
		display:flex;
		flex-flow:column;
		justify-content: center;
		align-items: center;
	}

	.progressbar-semicircle .progress-value-content {
		justify-content: flex-end;
	}

</style>

<svg class="progressbar progressbar-{style} {cls}" viewBox="0 0 100 {height}" width="{width}" height="auto" xmlns="http://www.w3.org/2000/svg">

	{#if showProgressValue}
		<defs>
			<mask id="{maskId}" x="0" y="0" width="100" height="100%">
				<SeriesArc store={maskStore} serieIdx={0} {thickness} {startAngle} {endAngle} />
				<Arc radius={50 - thickness} fill="#fff" {startAngle} {endAngle} closeArc={true} />
			</mask>
		</defs>
	{/if}

	<!-- If series don't have to be stacked, add only one background arc -->
	{#if addBackground && stackSeries}
		<Arc radius={$maskStore.series[0].radius} fill="{bgFillColor}" {startAngle} {endAngle} strokeWidth={thickness} stroke={bgColor} />
	{/if}

	{#each storeValue.series as serie, idx}
		<!-- If series have to be stacked, add one background arc with concentric radius for each series  -->
		{#if !stackSeries && addBackground}
			<Arc radius={serie.radius} fill="{bgFillColor}" {startAngle} {endAngle} strokeWidth={thickness} stroke={bgColor} />
		{/if}
		<SeriesArc {store} serieIdx={idx} {thickness} {startAngle} {endAngle} {stackSeries} />
	{/each}

	{#if showProgressValue}
		<foreignObject class="progress-value progress-value-inverted" x="0" y="0" width="100%" height="100%">
			<div class="progress-value-content" style="font-size:{textSize}%;color:{labelColor}">{@html $store.label}</div>
		</foreignObject>
		<foreignObject mask="url(#{maskId})"  class="progress-value" x="0" y="0" width="100%" height="100%">
			<div class="progress-value-content" style="font-size:{textSize}%;color:{labelColor}">{@html $store.label}</div>
		</foreignObject>
	{/if}
	<slot></slot>
</svg>