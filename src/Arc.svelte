<script>
	export let offset;
	export let prevOffset;
	export let color;
	export let thickness;

	if(!thickness)
		thickness = 2;

	//Based om https://stackoverflow.com/q/5736398
	function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
		angleInDegrees = angleInDegrees % 360;
		const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

		return {
			x: centerX + (radius * Math.cos(angleInRadians)),
			y: centerY + (radius * Math.sin(angleInRadians))
		};
	}

	function describeArc(x, y, radius, startPerc, endPerc){

		const startAngle = startPerc / 100 * 360;
		const endAngle = endPerc / 100 * 360;
		const start = polarToCartesian(x, y, radius, endAngle);
		const end = polarToCartesian(x, y, radius, startAngle);

		const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

		return [
			"M", start.x, start.y,
			"A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
		].join(" ");

	}
</script>
<path d="{describeArc(50, 50, 49.5 - thickness / 2, $prevOffset, $offset)}" fill="transparent" stroke="{color}" stroke-width="{thickness}"/>