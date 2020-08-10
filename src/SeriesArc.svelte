<script>
	import {getArcPath} from './utils.js';

	export let serie;
	export let thickness;
	export let startAngle;
	export let endAngle;
	export let bg = false;

	$: store = serie.store;

	if(!thickness)
		thickness = 2;

	function getPercArcPath(x, y, radius, startPerc, endPerc){

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
	<path d="{getPercArcPath(50, 50, serie.radius, $store.prevOffset, $store.offset)}" fill="transparent" stroke="{$store.color}" stroke-width="{thickness}" class="pb-arc {serie.cls ? serie.cls : ''}"/>
{:else}
	<path d="{getPercArcPath(50, 50, serie.radius, 0, 100)}" fill="transparent" stroke="{$store.color}" stroke-width="{thickness}" class="pb-arc {serie.cls ? serie.cls: ''}"/>
{/if}
