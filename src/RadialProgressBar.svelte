<script>
	import Arc from './Arc.svelte';
	import { getContext } from 'svelte';

	export let series = [];

	const valStore = getContext('valStore');
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
	.progress-value {
		font-size: 50%;
	}
</style>

<svg class="progressbar progressbar-radial" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
	<circle class="progress-bg" cx="50" cy="50" r="50"/>
	{#each series as serie}
		<Arc {...serie} />
	{/each}
	<text class="progress-value" text-anchor="middle" dominant-baseline="central" x="50%" y="50%">{$valStore}</text>
</svg>