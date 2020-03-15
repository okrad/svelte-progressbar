<script>
	export let serie;
	export let overallPerc;

	const store = serie.store;
</script>

<stop offset="{Math.round($store.prevOffset * 100 / $overallPerc)}%" stop-color="{$store.color}" class="{serie.cls}"/>
<stop offset="{Math.round($store.offset * 100 / $overallPerc)}%" stop-color="{$store.color}" class="{serie.cls}" />