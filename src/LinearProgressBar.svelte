<script>
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { getContext } from 'svelte';
	import Stop from './Stop.svelte';

	export let series = [];
	export let style = 'default';
	export let rx = 2;
	export let ry = 2;
	export let width = null;
	export let height = null;
	export let textSize = null;
	export let showProgressValue = true;

	const minOverallPerc = 0.001;
	const ts = new Date().getTime();
	const valStore = getContext('valStore');
	const maskId = 'tx_mask_' + ts + Math.floor(Math.random() * 999);
	const grId = 'pb_gradient_' + ts + Math.floor(Math.random() * 999);

	if(width == null) {
		//Default width when not specified
		width = 150;
	}

	if(height == null) {
		//Default height when not specified
		height = style == 'thin' ? 1 : 14;
	}

	if(textSize == null)
		textSize = style == 'thin' ? 40 : 70;

	let ypos = 0;
	if(style == 'thin') {
		rx = .2;
		ry = .2;
		ypos = 100 - height;
	}

	//Start with a number slightly greater than 0 to avoid divisions by zero when computing stops
	const overallPerc = tweened(minOverallPerc, {
		duration: 1000,
		easing: cubicOut
	});

	$: {
		overallPerc.set(series.reduce((a, s) => a + s.perc < 100 ? a + s.perc : 100, minOverallPerc));
	}
</script>

<style>

	.progressbar-thin {
		overflow: visible;
	}

	.progress-bg {
		fill: #f1f1f1;
	}

	.progress-value-inverted {
		fill: #fff;
	}

</style>

<svg class="progressbar progressbar-{style}" viewBox="0 0 100 {height}" width="{width}" xmlns="http://www.w3.org/2000/svg">
	<defs>
		<linearGradient id="{grId}">
			{#each series as serie}
				<Stop prevOffset={serie.prevOffset} offset={serie.offset} color={serie.color} {overallPerc}/>
			{/each}
		</linearGradient>
		{#if style == 'default' && showProgressValue}
			<mask id="{maskId}" x="0" y="0" width="100" height="100%">
				<rect width="{100 - $overallPerc}%" height="100%" x="{$overallPerc}%" y="0" fill="#fff" />
			</mask>
		{/if}
	</defs>

	{#if style == 'thin'}
		<rect width="100" height="100%" x="0" y="0" class="progress-bg"></rect>
		<rect width="{$overallPerc}%" height="100%" x="0" y="0" fill="url(#{grId})"></rect>
		{#if showProgressValue}
			<text class="progress-value" text-anchor="middle" x="50%" y="-100%" font-size="{textSize}%">{$valStore}</text>
		{/if}
	{:else}
		<rect width="100" height="100%" {rx} {ry} y="0" class="progress-bg"></rect>
		<rect width="{$overallPerc}%" height="100%" {rx} {ry} y="0" fill="url(#{grId})"></rect>
		{#if showProgressValue}
			<text class="progress-value progress-value-inverted" text-anchor="middle" dominant-baseline="central" x="50%" y="50%" font-size="{textSize}%">{$valStore}</text>
			<text mask="url(#{maskId})" class="progress-value" text-anchor="middle" dominant-baseline="central" x="50%" y="50%" font-size="{textSize}%">{$valStore}</text>
		{/if}
	{/if}
</svg>