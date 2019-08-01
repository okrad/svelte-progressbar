<script>
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import Arc from './Arc.svelte';
	import { getContext } from 'svelte';

	export let series = [];
	export let thickness = null;
	export let width = 100;
	export let height = 100;

	let textSize;

	const ts = new Date().getTime();
	const maskId = 'tx_mask_' + ts + Math.floor(Math.random() * 999);
	const valStore = getContext('valStore');

	const vbWidth = 100;
	const vbHeight = vbWidth * (height / width);

	const twOpts = {
		duration: 1000,
		easing: cubicOut
	};

	const maskSerie = {
		offset: tweened(100, twOpts),
		prevOffset: tweened(0, twOpts),
		color: '#fff'
	};

	$: {
		maskSerie.prevOffset.set(series.reduce((a, s) => a + s.perc < 100 ? a + s.perc : 100, 0));
		textSize =  150 / series.length;
	}


</script>

<style>
	.progress-bg {
		fill: #f1f1f1;
	}

	.progressbar-radial .progress-bg {
		fill: #fff;
		stroke-width: 1;
		/* stroke: #f1f1f1; */
		stroke: #ddd;
	}

	.progress-value-inverted {
		fill: #fff;
	}

	/* .progress-value {
		font-size: 150%;
	} */

</style>

<svg class="progressbar progressbar-radial" viewBox="0 0 {vbWidth} {vbHeight}" width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">
	<defs>
		<mask id="{maskId}" x="0" y="0" width="100" height="100%">
			<Arc {...maskSerie} {thickness} />
			<circle cx="50" cy="50" r="{50 - thickness}" fill="#fff" />
		</mask>
	</defs>

	<circle class="progress-bg" cx="50" cy="50" r="49"/>
	{#each series as serie}
		<Arc offset = {serie.offset} prevOffset = {serie.prevOffset} color = {serie.color}  {thickness} />
	{/each}
	<text class="progress-value progress-value-inverted" text-anchor="middle" dominant-baseline="central" x="50%" y="50%" font-size="{textSize}%">{$valStore}</text>
	<text mask="url(#{maskId})"  class="progress-value" text-anchor="middle" dominant-baseline="central" x="50%" y="50%" font-size="{textSize}%">{$valStore}</text>
</svg>