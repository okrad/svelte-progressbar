<script lang="ts">

	// @ts-check

	import type {SeriesStore} from './types';
	import ProgressLabel from './ProgressLabel.svelte';

	export let height: number = null;
	export let textSize: number = null;
	export let showProgressValue: boolean = true;
	export let addBackground: boolean = true;
	export let bgColor: string = '#f1f1f1';
	export let labelColor: string = null;
	export let invLabelColor: string = null;
	export let store: SeriesStore;
	export let cls: string = '';
	export let path: string = null;
	export let pathFn: any = () => '';
	export let fillDirection: string = 'l2r';
	export let labelAlignX: string = 'center'; //center, left ,leftOf, right, rightOf
	export let labelAlignY: string = 'middle'; //middle, top, bottom, above, below
	export let showInvertedLabel: boolean = labelAlignX == 'center' && labelAlignY == 'middle';
	export let style: string;

	let canvasPercWidth = 0;
	let canvasPercHeight = 0;
	let canvasPercX = 0;
	let canvasPercY = 0;

	let gradientStartPercX: number = 0;
	let gradientEndPercX: number = 0;
	let gradientStartPercY: number = 0;
	let gradientEndPercY: number = 0;

	let maskWidth = 0;
	let maskHeight = 0;
	let maskX = 0;
	let maskY = 0;

	const ts = new Date().getTime();

	const maskId = 'tx_mask_' + ts + Math.floor(Math.random() * 999);
	const grId = 'pb_gradient_' + ts + Math.floor(Math.random() * 999);

	if(fillDirection == null)
		fillDirection = 'l2r';

	export let actWidth: number = 0;
	let vbHeight: number = 0;
	let scaleX: number = 1;
	let scaleY: number = 1;

	$: {
		if(actWidth > 0) {
			vbHeight = height * 100 / actWidth;
			scaleX = 100 / actWidth;
			scaleY = vbHeight / height;
		}
	}

	$: {
		if(pathFn)
			path = pathFn(100, vbHeight);
	}

	$: {
		if( (fillDirection == 'l2r') || (fillDirection == 'r2l') ) {

			canvasPercWidth = $store.overallPerc;
			canvasPercHeight = height;

			gradientEndPercX = $store.overallPerc;

			maskWidth = 100 - $store.overallPerc;
			maskHeight = 100;

			maskX = $store.overallPerc;

			if(fillDirection == 'r2l') {
				// canvasPercX = canvasWidth - canvasPercWidth;
				canvasPercX = 100 - canvasPercWidth;
				maskX = 0;
				gradientStartPercX = 100;
				gradientEndPercX = 100 - $store.overallPerc;
			}

		}
		else if( (fillDirection == 't2b') || (fillDirection == 'b2t')) {

			maskWidth = 100;
			maskHeight = 100 - $store.overallPerc;
			maskY = $store.overallPerc;

			canvasPercWidth = 100;
			canvasPercHeight = $store.overallPerc * height / 100;

			gradientStartPercY = 0;
			gradientEndPercY = $store.overallPerc;

			if(fillDirection == 'b2t') {
				canvasPercY = height - canvasPercHeight;
				maskY = 0;
				gradientStartPercY = 100;
				gradientEndPercY = 100 - $store.overallPerc;
			}

		}

	}
</script>

<style>
	.progressbar {
		overflow: visible;
	}
</style>

<svg class="progressbar progressbar-{style} {cls}" viewBox="0 0 100 {vbHeight}" width="100%" height="{height}" xmlns="http://www.w3.org/2000/svg">
	<defs>
		<linearGradient id="{grId}" x1="{gradientStartPercX}%" x2="{gradientEndPercX}%" y1="{gradientStartPercY}%" y2="{gradientEndPercY}%">
			{#each $store.series as serie, seriesIdx}
				{#if serie.perc > 0}
					<stop offset="{Math.round( $store.series[seriesIdx].prevOffset)}%" stop-color="{$store.series[seriesIdx].color}" />
					<stop offset="{Math.round( $store.series[seriesIdx].prevOffset + $store.series[seriesIdx].perc)}%" stop-color="{$store.series[seriesIdx].color}" />
				{/if}
			{/each}
		</linearGradient>
		{#if showProgressValue}
			<mask id="{maskId}" x="0" y="0" width="100%" height="{height}">
				<rect width="{maskWidth}%" height="{maskHeight}%" x="{maskX}%" y="{maskY}%" fill="#fff" />
			</mask>
		{/if}
	</defs>

	{#if addBackground}
		<path d={path} x="0" y="0" fill={bgColor} class="progress-bg"></path>
	{/if}
	<svg width="{canvasPercWidth}%" height="{canvasPercHeight}" x="{canvasPercX}" y="{canvasPercY}" viewBox="{canvasPercX} {canvasPercY} {canvasPercWidth} {canvasPercHeight}">
		<path d={path} x="0" y="0" fill="url(#{grId})"></path>
	</svg>
	{#if showProgressValue}
		<ProgressLabel
			{store}
			{textSize}
			{labelColor}
			{invLabelColor}
			{labelAlignX}
			{labelAlignY}
			{showInvertedLabel}
			{maskId}
			{style}
			{scaleX}
			{scaleY}>
		</ProgressLabel>
	{/if}
</svg>