export function getArcPath(x, y, radius, startAngle, endAngle, closed){

	//Avoid overlapping of start and end positions...
	if(endAngle == 360)
		endAngle = 359.9999;

	const start = polarToCartesian(x, y, radius, endAngle);
	const end = polarToCartesian(x, y, radius, startAngle);

	const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

	return [
		"M", start.x, start.y,
		"A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
		closed ? 'Z' : ''
	].join(" ");

}

//Based on https://stackoverflow.com/q/5736398
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
	angleInDegrees = angleInDegrees % 360;
	const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

	return {
		x: centerX + (radius * Math.cos(angleInRadians)),
		y: centerY + (radius * Math.sin(angleInRadians))
	};
}


