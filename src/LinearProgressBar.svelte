<script>
	export let style = 'default';
	export let rx = 2;
	export let ry = 2;
	export let width = null;
	export let height = null;
	export let textSize = null;
	export let showProgressValue = true;
	export let addBackground = true;
	export let bgColor = null;
	export let labelColor = null;
	export let store;

	const ts = new Date().getTime();

	const maskId = 'tx_mask_' + ts + Math.floor(Math.random() * 999);
	const grId = 'pb_gradient_' + ts + Math.floor(Math.random() * 999);

	if(width == null) {
		//Default width when not specified
		width = 150;
	}

	if(height == null) {
		//Default height when not specified
		height = style == 'thin' ? 1 : 14;
	}

	if(textSize == null)
		textSize = style == 'thin' ? 40 : 70;

	let ypos = 0;
	if(style == 'thin') {
		rx = .2;
		ry = .2;
		ypos = 100 - height;
	}

	let dominantBaseline = '';
	let dy = '0';
 	if(typeof window !== 'undefined' && (window.navigator.userAgent.indexOf('Trident') > -1 || window.navigator.userAgent.indexOf('Edge') > -1)) {
		//Ugly workaround needed only in legacy mode to adjust the vertical positioning of the value
		//in IE/Edge (that don't support dominant-baseline)...
		dy = '-.4em';
	}
	else {
		dominantBaseline = 'central';
	}

</script>

<style>
	.progressbar-thin {
		overflow: visible;
	}

	.progress-bg {
		fill: #f1f1f1;
	}

	.progress-value-inverted {
		fill: #fff;
		color: #fff;
	}

	.progress-value-content {
		position:absolute;
		top:0;
		left:0;
		right:0;
		bottom:0;
		display:flex;
		flex-flow:row nowrap;
		justify-content: center;
		align-items: center;
	}

	.progressbar-thin .progress-value {
		overflow: visible;
	}

	.progressbar-thin .progress-value-content {
		transform: translateY(-100%);
	}

</style>

<svg class="progressbar progressbar-{style}" viewBox="0 0 100 {height}" width="{width}" height={width * height / 100} xmlns="http://www.w3.org/2000/svg">
	<defs>
		<linearGradient id="{grId}">
			{#each $store.series as serie, seriesIdx}
				<stop offset="{Math.round($store.series[seriesIdx].perc * 100 / $store.overallPerc)}%" stop-color="{$store.series[seriesIdx].color}" />
			{/each}
		</linearGradient>
		{#if style == 'default' && showProgressValue}
			<mask id="{maskId}" x="0" y="0" width="100" height="100%">
				<rect width="{100 - $store.overallPerc}%" height="100%" x="{$store.overallPerc}%" y="0" fill="#fff" />
			</mask>
		{/if}
	</defs>

	{#if style == 'thin'}
		{#if addBackground}
			<rect width="100" height="100%" x="0" y="0" fill={bgColor} class="progress-bg"></rect>
		{/if}
		<rect width="{$store.overallPerc}%" height="100%" x="0" y="0" fill="url(#{grId})"></rect>
		{#if showProgressValue}
			<foreignObject class="progress-value" x="0" y="0" width="100%" height="100%">
				<div class="progress-value-content" style="font-size:{textSize}%;color:{labelColor};top:-{height}px;">{@html $store.label}</div>
			</foreignObject>
		{/if}
	{:else}
		{#if addBackground}
			<rect width="100" height="100%" {rx} {ry} y="0" fill={bgColor} class="progress-bg"></rect>
		{/if}
		<rect width="{$store.overallPerc}%" height="100%" {rx} {ry} y="0" fill="url(#{grId})"></rect>
		{#if showProgressValue}
			<foreignObject class="progress-value progress-value-inverted" x="0" y="0" width="100%" height="100%">
				<div class="progress-value-content" style="font-size:{textSize}%;">{@html $store.label}</div>
			</foreignObject>
			<foreignObject mask="url(#{maskId})" class="progress-value" x="0" y="0" width="100%" height="100%">
				<div class="progress-value-content" style="font-size:{textSize}%;color:{labelColor};">{@html $store.label}</div>
			</foreignObject>
		{/if}
	{/if}
</svg>