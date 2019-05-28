<script>
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import Arc from './Arc.svelte';
	import { getContext } from 'svelte';

	export let series = [];
	export let thickness = null;

	const ts = new Date().getTime();
	const maskId = 'tx_mask_' + ts + Math.floor(Math.random() * 999);
	const valStore = getContext('valStore');

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
	}


</script>

<style>
	.progress-bg {
		fill: #f1f1f1;
	}

	.progressbar-radial .progress-bg {
		fill: transparent;
		stroke-width: 1;
		stroke: #f1f1f1;
	}

	.progress-value-inverted {
		fill: #fff;
	}

/*
	.progress-value {
		font-size: 50%;
	}
*/
</style>
<svg class="progressbar progressbar-radial" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
	<defs>
		<mask id="{maskId}" x="0" y="0" width="100" height="100%">
			<Arc {...maskSerie} {thickness} />
			<circle cx="50" cy="50" r="{50 - thickness}" fill="#fff" />
		</mask>
	</defs>

	<circle class="progress-bg" cx="50" cy="50" r="49"/>
	{#each series as serie}
		<Arc {...serie} {thickness} />
	{/each}
	<text class="progress-value progress-value-inverted" text-anchor="middle" dominant-baseline="central" x="50%" y="50%">{$valStore}</text>
	<text mask="url(#{maskId})"  class="progress-value" text-anchor="middle" dominant-baseline="central" x="50%" y="50%">{$valStore}</text>
</svg>