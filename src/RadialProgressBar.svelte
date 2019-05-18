<script>
	import Arc from './Arc.svelte';
	import { getContext } from 'svelte';

	export let series = [];

	const valStore = getContext('valStore');
</script>

<style>
	.progressbar {
		fill: #f1f1f1;
	}

	.progressbar-radial {
		fill: transparent;
		stroke-width: 1;
		stroke: #f1f1f1;
	}
</style>

<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
	<circle class="progressbar progressbar-radial" cx="50" cy="50" r="50"/>
	{#each series as serie}
		<Arc {...serie} />
	{/each}
	<text class="progress-value" text-anchor="middle" dominant-baseline="central" x="50%" y="50%">{$valStore}</text>
</svg>