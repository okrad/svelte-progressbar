<script>
	export let serie;
	export let thickness;
	export let bg = false;

	$: store = serie.store;

	if(!thickness)
		thickness = 2;

	//Based on https://stackoverflow.com/q/5736398
	function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
		angleInDegrees = angleInDegrees % 360;
		const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

		return {
			x: centerX + (radius * Math.cos(angleInRadians)),
			y: centerY + (radius * Math.sin(angleInRadians))
		};
	}

	function describeArc(x, y, radius, startPerc, endPerc){

		if(endPerc > 100)
			endPerc = 100;

		const startAngle = startPerc / 100 * 360;
		let endAngle = endPerc / 100 * 360;

		//Avoid overlapping of start and end positions...
		if(endAngle == 360)
			endAngle = 359.9999;

		const start = polarToCartesian(x, y, radius, endAngle);
		const end = polarToCartesian(x, y, radius, startAngle);

		const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

		return [
			"M", start.x, start.y,
			"A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
		].join(" ");

	}

</script>
{#if !bg}
	<path d="{describeArc(50, 50, serie.radius, $store.prevOffset, $store.offset)}" fill="transparent" stroke="{$store.color}" stroke-width="{thickness}" class="pb-arc {serie.cls}"/>
{:else}
	<path d="{describeArc(50, 50, serie.radius, 0, 100)}" fill="transparent" stroke="{$store.color}" stroke-width="{thickness}" class="pb-arc {serie.cls}"/>
{/if}
