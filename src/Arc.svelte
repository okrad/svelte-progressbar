<script lang="ts">
	// @ts-check
	import {getArcPath} from './utils';

	export let radius: number;
	export let startAngle: number = null;
	export let endAngle: number = null;
	export let fill: string;
	export let stroke: string;
	export let strokeWidth: number = 0;
	export let cls: string;
	export let closeArc: boolean = false;
</script>

<path d="{getArcPath(50, 50, radius, startAngle, endAngle, closeArc)}" {fill} {stroke} stroke-width={strokeWidth} class="{cls}"/>