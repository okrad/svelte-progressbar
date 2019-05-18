<script>
	export let prevOffset;
	export let offset;
	export let overallPerc;
	export let color;
</script>

<stop offset="{Math.round($prevOffset * 100 / $overallPerc)}%" stop-color="{color}"/>
<stop offset="{Math.round($offset * 100 / $overallPerc)}%" stop-color="{color}"/>