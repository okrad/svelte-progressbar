<script lang="ts">

	// @ts-check
	import { onMount } from 'svelte';
	import type {SeriesStore} from './types';
	import ProgressLabel from './ProgressLabel.svelte';

	export let width: number = null;
	export let height: number = null;
	export let textSize: number = null;
	export let showProgressValue: boolean = true;
	export let addBackground: boolean = true;
	export let bgColor: string = null;
	export let labelColor: string = null;
	export let invLabelColor: string = null;
	export let store: SeriesStore;
	export let cls: string = '';
	export let path: string = null;
	export let fillDirection: string = 'l2r';
	export let labelAlignX: string = 'center'; //center, left ,leftOf, right, rightOf
	export let labelAlignY: string = 'middle'; //middle, top, bottom, above, below
	export let showInvertedLabel: boolean = labelAlignX == 'center' && labelAlignY == 'middle';
	export let style: string;

	let canvasWidth = 0;
	let canvasHeight = 0;

	let canvasPercWidth = 0;
	let canvasPercHeight = 0;
	let canvasPercX = 0;
	let canvasPercY = 0;

	let vboxSize: number;
	let canvasSize: number;

	let gradientStartPercX: number = 0;
	let gradientEndPercX: number = 0;
	let gradientStartPercY: number = 0;
	let gradientEndPercY: number = 0;

	let maskWidth = 0;
	let maskHeight = 0;
	let maskX = 0;
	let maskY = 0;

	let pathEl: SVGPathElement;

	const ts = new Date().getTime();

	const maskId = 'tx_mask_' + ts + Math.floor(Math.random() * 999);
	const grId = 'pb_gradient_' + ts + Math.floor(Math.random() * 999);

	const norm = (p: number, fs: number, s: number): number => (p * fs / s);

	if(width == null)
		width = 150;

	if(height == null)
		height = 150;

	if(fillDirection == null)
		fillDirection = 'l2r';

	onMount(() => {
		const bbox = pathEl.getBBox();

		canvasWidth = bbox.width;
		canvasHeight = bbox.height;
	});

	$: {
		if( (fillDirection == 'l2r') || (fillDirection == 'r2l') ) {

			canvasSize = canvasWidth;

			canvasPercWidth = $store.overallPerc * canvasWidth / 100;
			canvasPercHeight = canvasHeight;

			gradientEndPercX = $store.overallPerc;

			maskWidth = 100 - $store.overallPerc;
			maskHeight = 100;

			maskX = $store.overallPerc;

			if(fillDirection == 'r2l') {
				canvasPercX = canvasWidth - canvasPercWidth;
				maskX = 0;
				gradientStartPercX = 100;
				gradientEndPercX = 100 - $store.overallPerc;
			}

		}
		else if( (fillDirection == 't2b') || (fillDirection == 'b2t')) {

			canvasSize = canvasHeight;

			maskWidth = 100;
			maskHeight = 100 - $store.overallPerc;
			maskY = $store.overallPerc;

			canvasPercWidth = canvasWidth;
			canvasPercHeight = $store.overallPerc * canvasHeight / 100;

			gradientStartPercY = 0;
			gradientEndPercY = $store.overallPerc;

			if(fillDirection == 'b2t') {
				canvasPercY = canvasHeight - canvasPercHeight;
				maskY = 0;
				gradientStartPercY = 100;
				gradientEndPercY = 100 - $store.overallPerc;
			}

		}

		vboxSize = $store.overallPerc * canvasSize / 100;
	}
</script>

<style>
	.progressbar {
		overflow: visible;
	}

	.progress-bg {
		fill: #f1f1f1;
	}

	.progressbar-thin {
		overflow: visible;
	}
</style>

<svg class="progressbar progressbar-{style} {cls}" viewBox="0 0 {canvasWidth} {canvasHeight}" width="{width}" height={height} xmlns="http://www.w3.org/2000/svg">
	<defs>
		<linearGradient id="{grId}" x1="{gradientStartPercX}%" x2="{gradientEndPercX}%" y1="{gradientStartPercY}%" y2="{gradientEndPercY}%">
			{#each $store.series as serie, seriesIdx}
				<stop offset="{Math.round( norm($store.series[seriesIdx].prevOffset, canvasSize, vboxSize))}%" stop-color="{$store.series[seriesIdx].color}" />
				<stop offset="{Math.round( norm($store.series[seriesIdx].prevOffset + $store.series[seriesIdx].perc, canvasSize, vboxSize))}%" stop-color="{$store.series[seriesIdx].color}" />
			{/each}
		</linearGradient>
		{#if showProgressValue}
			<mask id="{maskId}" x="0" y="0" width="{canvasWidth}" height="{canvasHeight}">
				<rect width="{maskWidth}%" height="{maskHeight}%" x="{maskX}%" y="{maskY}%" fill="#fff" />
			</mask>
		{/if}
	</defs>

	{#if addBackground}
		<path d={path} x="0" y="0" fill={bgColor} class="progress-bg"></path>
	{/if}
	<svg width="{canvasPercWidth}" height="{canvasPercHeight}" x="{canvasPercX}" y="{canvasPercY}" viewBox="{canvasPercX} {canvasPercY} {canvasPercWidth} {canvasPercHeight}">
		<path bind:this={pathEl} d={path} x="0" y="0" fill="url(#{grId})"></path>
	</svg>
	{#if showProgressValue}
		<ProgressLabel
			{store} {
			textSize}
			{labelColor}
			{invLabelColor}
			{labelAlignX}
			{labelAlignY}
			{showInvertedLabel}
			{maskId}
			{style}>
		</ProgressLabel>
	{/if}
</svg>