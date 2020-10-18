<script>
	import Arc from './Arc.svelte';
	import SeriesArc from './SeriesArc.svelte';
	import { seriesStore } from './stores.js';

	export let thickness = 5;
	export let width = null;
	export let height = null;
	export let textSize = null;
	export let showProgressValue = true;
	export let stackSeries = true;
	export let margin = 0;
	export let addBackground = true;
	export let bgColor = '#e5e5e5';
	export let bgFillColor = 'transparent';
	export let labelColor = '#555';
	export let startAngle = 0;
	export let endAngle = 360;
	export let colors;
	export let thresholds;
	export let store;
	export let style;
	export let cls = '';

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

	let textY = 50;
	let baseline = 'central';

	if(endAngle - startAngle <= 180) {
		textY = 100;
		baseline = 'auto';
	}

	if(textSize == null)
		textSize = 150;

	const maskSeries = [{
		perc: $store.overallPerc,
		radius: 50 - (thickness * $store.series.length),
		color: '#fff'
	}];

	const maskStore = seriesStore(maskSeries, {colors, thresholds, stackSeries: false, thickness, margin});

</script>

<style>
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
				<Arc radius={50 - thickness} fill="#fff" {startAngle} {endAngle} closeArc=true />
			</mask>
		</defs>
	{/if}

	<!-- If series don't have to be stacked, add only one background arc -->
	{#if addBackground && stackSeries}
		<Arc radius={$maskStore.series[0].radius} fill="{bgFillColor}" {startAngle} {endAngle} strokeWidth={thickness} stroke={bgColor} />
	{/if}

	{#each $store.series as serie, idx}
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