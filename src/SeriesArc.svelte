<script>
	import {getArcPath} from './utils.js';

	export let thickness;
	export let startAngle;
	export let endAngle;
	export let bg = false;
	export let serieIdx;
	export let store;

	if(!thickness)
		thickness = 2;

	function getPercArcPath(x, y, radius, startPerc, endPerc) {
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
	<path d="{getPercArcPath(50, 50, $store.series[serieIdx].radius, $store.series[serieIdx].prevOffset, $store.series[serieIdx].prevOffset + $store.series[serieIdx].perc)}" fill="transparent" stroke="{$store.series[serieIdx].color}" stroke-width="{thickness}" class="pb-arc"/>
{:else}
	<path d="{getPercArcPath(50, 50, $store.series[serieIdx].radius, 0, 100)}" fill="transparent" stroke="{$store.series[serieIdx].color}" stroke-width="{thickness}" class="pb-arc"/>
{/if}