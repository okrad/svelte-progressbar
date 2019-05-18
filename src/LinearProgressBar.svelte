<script>
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { getContext } from 'svelte';
	import Stop from './Stop.svelte';

	export let series = [];
	export let style = 'default';
	export let rx = 2;
	export let ry = 2;

	const valStore = getContext('valStore');

	const ts = new Date().getTime();
	const maskId = 'tx_mask_' + ts + Math.floor(Math.random() * 999);
	const grId = 'pb_gradient_' + ts + Math.floor(Math.random() * 999);

	let barHeight = 100;
	let ypos = 0;
	if(style == 'thin') {
		barHeight = 5;
		rx = .5;
		ry = .5;
		ypos = 100 - barHeight;
	}

	const overallPerc = tweened(0.1, {
		duration: 1000,
		easing: cubicOut
	});

	$: {
		overallPerc.set(series.reduce((a, s) => a + s.perc < 100 ? a + s.perc : 100, 0));
	}
</script>

<style>
	.progressbar {
		fill: #f1f1f1;
	}

	.progress-value-negative {
		fill: #fff;
	}
</style>

<svg viewBox="0 0 100 16" xmlns="http://www.w3.org/2000/svg">
	{#if style == 'default'}
		<defs>
			<linearGradient id="{grId}">
				{#each series as serie}
					<Stop {...serie} {overallPerc}/>
				{/each}
			</linearGradient>
			<mask id="{maskId}" x="0" y="0" width="100" height="100%">
				<rect width="{100 - $overallPerc}%" height="100%" x="{$overallPerc}%" y="0" fill="#fff" />
			</mask>
		</defs>
	{/if}

	<rect width="100" height="{barHeight}%" {rx} {ry} y="{ypos}%" class="progressbar"></rect>
	<rect width="{$overallPerc}%" height="{barHeight}%" {rx} {ry} fill="url(#{grId})"></rect>
	{#if style == 'thin'}
		<text class="progress-value" text-anchor="middle" dominant-baseline="central" x="50%" y="50%">{$valStore}</text>
	{:else}
		<text class="progress-value progress-value-negative" text-anchor="middle" dominant-baseline="central" x="50%" y="50%">{$valStore}</text>
		<text mask="url(#{maskId})" class="progress-value" text-anchor="middle" dominant-baseline="central" x="50%" y="50%">{$valStore}</text>
	{/if}
</svg>