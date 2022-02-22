<script lang="ts">
	// @ts-check

	import type {SeriesStore} from './types';
	import CustomShapeProgressBar from './CustomShapeProgressBar.svelte';

	export let style: string = 'default';
	export let rx: number = style == 'thin' ? .2 : 2;
	export let ry: number = style == 'thin' ? .2 : 2;
	export let width: number = 150;
	export let height: number = style == 'thin' ? 1 : 14;
	export let store: SeriesStore;
	export let labelAlignY: string = style == 'thin' ? 'above' : 'middle';

	const roundedRect = (w: number, h: number, rx: number, ry: number): string => {
		return [
			'M 0 ' + ry,
			'A ' + rx + ' ' + ry + ' 0 0 1 ' + rx + ' 0',
			'H ' + (w - rx) + ' ',
			'A ' + rx + ' ' + ry + ' 0 0 1 ' + w + ' ' + rx,
			'V ' + (h - ry),
			'A ' + rx + ' ' + ry + ' 0 0 1 ' + (w - rx) + ' ' + h,
			'H ' + rx,
			'A ' + rx + ' ' + ry + ' 0 0 1 0 ' + (h - ry),
			'Z'
		].join(' ')
	};
</script>

<CustomShapeProgressBar
	{...$$props}
	path="{roundedRect(width, height, rx, ry)}"
	{width}
	{height}
	{store}
	{labelAlignY}
	{style}>
</CustomShapeProgressBar>