// @ts-check

interface CartesianCoords {
	x: number,
	y: number
};

export function getArcPath(x: number, y: number, radius: number, startAngle: number, endAngle: number, closed: boolean): string {

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
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number): CartesianCoords {
	angleInDegrees = angleInDegrees % 360;
	const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

	return {
		x: centerX + (radius * Math.cos(angleInRadians)),
		y: centerY + (radius * Math.sin(angleInRadians))
	};
}


//Converts a #ffffff hex string into an [r,g,b] array
//See https://stackoverflow.com/a/5624139
function hex2rgb(hex: string): number[] {

	if(hex.length == 4) {
		// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
		const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
		hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
	}

	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

	return result ? [
		parseInt(result[1], 16),
		parseInt(result[2], 16),
		parseInt(result[3], 16)
	 ] : null;
}

function rgb2hex(rgb: number[]): string {
    return "#" + ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1);
}

/**
 *  Interpolate two hex colors
 */
export function interpolateColor(hexColor1: string, hexColor2: string, factor: number): string {
	const rgbColor1 = hex2rgb(hexColor1);
	const rgbColor2 = hex2rgb(hexColor2);

	let result = rgbColor1.slice();
	for(let i = 0; i < 3; i++) {
		result[i] = Math.round(result[i] + factor * (rgbColor2[i] - rgbColor1[i]));
	}

	return rgb2hex(result);
}

