<script>
	export let prevOffset;
	export let offset;
	export let overallPerc;
	export let color;
	export let cls;
</script>

<stop offset="{Math.round($prevOffset * 100 / $overallPerc)}%" stop-color="{color}" class="{cls}"/>
<stop offset="{Math.round($offset * 100 / $overallPerc)}%" stop-color="{color}" class="{cls}" />