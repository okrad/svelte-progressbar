<script lang="ts">
	// @ts-check
	import type {SeriesStore} from './types';

	import {getArcPath} from './utils';

	export let thickness: number;
	export let startAngle: number;
	export let endAngle: number;
	export let bg: boolean = false;
	export let serieIdx: number;
	export let store: SeriesStore;
	export let stackSeries: boolean;

	function getPercArcPath(x: number, y: number, radius: number, startPerc: number, endPerc: number): string {
		if(startPerc < 0)
			startPerc = 0;

		if(endPerc > 100)
			endPerc = 100;

		const sAngle = startAngle + startPerc / 100 * (endAngle - startAngle);
		const eAngle = startAngle + endPerc / 100 * (endAngle - startAngle);

		return getArcPath(x, y, radius, sAngle, eAngle, false);
	}
</script>
{#if !bg}
	{#if stackSeries}
		{#if $store.series[serieIdx].prevOffset < 100}
			<path d="{getPercArcPath(50, 50, $store.series[serieIdx].radius, $store.series[serieIdx].prevOffset, $store.series[serieIdx].prevOffset + $store.series[serieIdx].perc)}" fill="transparent" stroke="{$store.series[serieIdx].color}" stroke-width="{thickness}" class="pb-arc"/>
		{/if}
	{:else}
		<path d="{getPercArcPath(50, 50, $store.series[serieIdx].radius, 0, $store.series[serieIdx].perc)}" fill="transparent" stroke="{$store.series[serieIdx].color}" stroke-width="{thickness}" class="pb-arc"/>
	{/if}
{:else}
	<path d="{getPercArcPath(50, 50, $store.series[serieIdx].radius, 0, 100)}" fill="transparent" stroke="{$store.series[serieIdx].color}" stroke-width="{thickness}" class="pb-arc"/>
{/if}