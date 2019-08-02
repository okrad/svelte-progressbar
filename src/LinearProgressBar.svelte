<script>
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';
	import { getContext } from 'svelte';
	import Stop from './Stop.svelte';

	export let series = [];
	export let style = 'default';
	export let rx = 2;
	export let ry = 2;
	export let width = 100;
	export let height = 16;
	export let thickness;
	export let textSize;

	const minOverallPerc = 0.001;
	const ts = new Date().getTime();
	const vbHeight = 100 * (height / width);
	const valStore = getContext('valStore');
	const maskId = 'tx_mask_' + ts + Math.floor(Math.random() * 999);
	const grId = 'pb_gradient_' + ts + Math.floor(Math.random() * 999);

	let ypos = 0;
	if(style == 'thin') {
		if(!thickness)
			thickness = 10;
		rx = .2;
		ry = .2;
		ypos = 100 - thickness;
	}
	else {
		if(!thickness)
			thickness = 100;
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
	.progress-bg {
		fill: #f1f1f1;
	}

	.progress-value-inverted {
		fill: #fff;
	}

</style>

<svg class="progressbar progressbar-{style}" viewBox="0 0 100 {vbHeight}" width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">
	<defs>
		<linearGradient id="{grId}">
			{#each series as serie}
				<Stop prevOffset={serie.prevOffset} offset={serie.offset} color={serie.color} {overallPerc}/>
			{/each}
		</linearGradient>
		{#if style == 'default'}
			<mask id="{maskId}" x="0" y="0" width="100" height="{thickness}%">
				<rect width="{100 - $overallPerc}%" height="{thickness}%" x="{$overallPerc}%" y="{100 - thickness}%" fill="#fff" />
			</mask>
		{/if}
	</defs>

	<rect width="100" height="{thickness}%" {rx} {ry} y="{100 - thickness}%" class="progress-bg"></rect>
	<rect width="{$overallPerc}%" height="{thickness}%" {rx} {ry} y="{100 - thickness}%" fill="url(#{grId})"></rect>
	{#if style == 'thin'}
		<text class="progress-value" text-anchor="middle" dominant-baseline="central" x="50%" y="{100 - textSize/1.5 - thickness}%" font-size="{textSize}%">{$valStore}</text>
	{:else}
		<text class="progress-value progress-value-inverted" text-anchor="middle" dominant-baseline="central" x="50%" y="50%" font-size="{textSize}%">{$valStore}</text>
		<text mask="url(#{maskId})" class="progress-value" text-anchor="middle" dominant-baseline="central" x="50%" y="50%" font-size="{textSize}%">{$valStore}</text>
	{/if}
</svg>