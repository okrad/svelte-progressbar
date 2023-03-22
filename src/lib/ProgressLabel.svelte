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
	export let showInvertedLabel: boolean = labelAlignX == 'center' && labelAlignY == 'middle';
	export let style: string = 'default';
	export let scaleX: number = 1;
	export let scaleY: number = 1;

	let lblStyle: Array<string>;
	let invLblStyle: Array<string>;
	let labelTranslateY = 0;

	if(textSize == null)
		textSize = 100;

	if(invLabelColor == null)
		invLabelColor = '#fff';

	$: {

		if(labelAlignY == 'above') {
			labelTranslateY = -100;
		}
		else if(labelAlignY == 'below') {
			labelTranslateY = 100;
		}

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

	.progress-value-content {
		position:absolute;
		top:0;
		left:0;
		right:0;
		bottom:0;
		display:flex;
		flex-flow:row nowrap;
		transform-origin: top;
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
		transform-origin: bottom;
	}

	.progress-value-content.above {
		top: 0;
		bottom: auto;
		transform-origin: top;
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
	<foreignObject class="progress-value progress-value-{style} progress-value-inverted" x="0" y="0" width="{100 / scaleX}%" height="{100 / scaleY}%" transform="scale({scaleX}, {scaleY})">
		<div class="progress-value-content {labelAlignX} {labelAlignY}" style="{invLblStyle.join(';')};transform:translateY({labelTranslateY}%)">{@html $store.label}</div>
	</foreignObject>
{/if}

<g mask={showInvertedLabel ? 'url(#' + maskId + ')' : null}>
	<foreignObject class="progress-value progress-value-{style}" x="0" y="0" width="{100 / scaleX}%" height="{100 / scaleY}%" transform="scale({scaleX}, {scaleY})">
		<div class="progress-value-content {labelAlignX} {labelAlignY}" style="{lblStyle.join(';')};transform:translateY({labelTranslateY}%)">{@html $store.label}</div>
	</foreignObject>
</g>
