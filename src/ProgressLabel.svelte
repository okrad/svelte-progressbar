<script lang="ts">
	// @ts-check
	import type {SeriesStore} from './types';

	export let textSize: number = null;
	export let labelColor: string = null;
	export let invLabelColor: string = null;
	export let store: SeriesStore;
	export let maskId: string;
	export let labelAlignX: string = 'center'; //center, left ,leftOf, right, rightOf
	export let labelAlignY: string = 'middle'; //middle, top, bottom, above, below
	export let showInvertedLabel: boolean = labelAlignX == 'center' && labelAlignY == 'middle'; //top, bottom
	export let style: string = 'default';

	let lblStyle: Array<string>;
	let invLblStyle: Array<string>;

	if(textSize == null)
		textSize = 100;

	if(invLabelColor == null)
		invLabelColor = '#fff';

	$: {
		lblStyle = [
			'font-size:' + textSize + '%',
		];

		if(labelColor)
			lblStyle.push('color:' + labelColor);

		invLblStyle = [
			'font-size:' + textSize + '%',
			'color:' + invLabelColor
		];
	}
</script>

<style>
	.progress-value {
		/* Fix for Safari positioning bug of foreignObject */
		/* See https://bugs.webkit.org/show_bug.cgi?id=23113 */
		position: fixed;
		overflow: visible;
	}

	.progress-value-thin {
		overflow: visible;
	}

	.progress-value-content {
		position:absolute;
		top:0;
		left:0;
		right:0;
		bottom:0;
		display:flex;
		flex-flow:row nowrap;
	}

	.progress-value-content.center {
		justify-content: center;
	}

	.progress-value-content.middle {
		align-items: center;
	}

	.progress-value-content.left {
		justify-content: flex-start;
	}

	.progress-value-content.right {
		justify-content: flex-end;
	}

	.progress-value-content.top {
		top: 0;
		bottom: auto;
	}

	.progress-value-content.bottom {
		top: auto;
		bottom: 0;
	}

	.progress-value-content.below {
		top: auto;
		bottom: 0;
		transform: translateY(100%);
	}

	.progress-value-content.above {
		top: 0;
		bottom: auto;
		transform: translateY(-100%);
	}

	.progress-value-content.leftOf {
		justify-content: flex-start;
		transform: translateX(-100%);
	}

	.progress-value-content.rightOf {
		justify-content: flex-end;
		transform: translateX(100%);
	}
</style>

{#if showInvertedLabel}
	<foreignObject class="progress-value progress-value-{style} progress-value-inverted" x="0" y="0" width="100%" height="100%">
		<div class="progress-value-content {labelAlignX} {labelAlignY}" style="{invLblStyle.join(';')}">{@html $store.label}</div>
	</foreignObject>
{/if}

<g mask={showInvertedLabel ? 'url(#' + maskId + ')' : null}>
	<foreignObject class="progress-value progress-value-{style}" x="0" y="0" width="100%" height="100%">
		<div class="progress-value-content {labelAlignX} {labelAlignY}" style="{lblStyle.join(';')}">{@html $store.label}</div>
	</foreignObject>
</g>
