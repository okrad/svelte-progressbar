<script>
	import Arc from './Arc.svelte';
	import { serieStore } from './stores.js';

	export let series = [];
	export let thickness = 5;
	export let width = null;
	export let height = null;
	export let textSize = null;
	export let showProgressValue = true;
	export let stackSeries = true;
	export let margin = 0;
	export let addBackground = true;
	export let bgColor = '#e5e5e5';
	export let valStore;

	const ts = new Date().getTime();
	const maskId = 'tx_mask_' + ts + Math.floor(Math.random() * 999);

	if(width == null)
		//Default width when not specified
		width = 75;

	if(height == null)
		//Default height when not specified
		height = 100;

	if(textSize == null)
		textSize = 150;

	const maskSerie = {
		radius: 50 - thickness / 2,
		color: '#fff'
	};

	maskSerie.store = serieStore(maskSerie);

	series.forEach((s, idx) => {
		if(!stackSeries)
			s.radius = 50 - (idx + 1) * thickness - (idx > 0 ? margin : 0);
		else
			s.radius = 50 - thickness / 2;
	});

	$: {
		maskSerie.store.setPerc(series.reduce((a, s) => (a + s.perc) < 100 ? a + s.perc : 100, 0), 0);
	}
</script>

<style>
	.progress-value-inverted {
		fill: #fff;
	}
</style>

<svg class="progressbar progressbar-radial" viewBox="0 0 100 {height}" width="{width}" xmlns="http://www.w3.org/2000/svg">
	{#if showProgressValue}
		<defs>
			<mask id="{maskId}" x="0" y="0" width="100" height="100%">
				<Arc serie={maskSerie} {thickness} />
				<circle cx="50" cy="50" r="{50 - thickness}" fill="#fff" />
			</mask>
		</defs>
	{/if}

	{#each series as serie}
		{#if addBackground}
			<circle cx="50" cy="50" r="{serie.radius}" fill="transparent" stroke-width="{thickness}" stroke="{bgColor}"/>
		{/if}
		<Arc {serie} {thickness} />
	{/each}
	{#if showProgressValue}
		<text class="progress-value progress-value-inverted" text-anchor="middle" dominant-baseline="central" x="50%" y="50%" font-size="{textSize}%">{$valStore}</text>
		<text mask="url(#{maskId})"  class="progress-value" text-anchor="middle" dominant-baseline="central" x="50%" y="50%" font-size="{textSize}%">{$valStore}</text>
	{/if}
</svg>