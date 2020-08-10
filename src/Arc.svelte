<script>
	import {getArcPath} from './utils.js';

	export let radius;
	export let startAngle = null;
	export let endAngle = null;
	export let fill;
	export let stroke;
	export let strokeWidth = 0;
	export let cls;
	export let closeArc = false;
</script>

<path d="{getArcPath(50, 50, radius, startAngle, endAngle, closeArc)}" {fill} {stroke} stroke-width={strokeWidth} class="{cls}"/>