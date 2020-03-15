import { tweened } from 'svelte/motion';
import { cubicOut } from 'svelte/easing';
import { derived, readable } from 'svelte/store';
import { interpolateLab } from 'd3-interpolate';

const twOpts = {
	duration: 1000,
	easing: cubicOut
};

export function serieStore(serie) {

	const s = tweened({
		offset: 0,
		prevOffset: 0,
		color: serie.color
	}, {
		...twOpts,
		interpolate: (startVal, targetVal) => t => {
			const val = {
				offset: (targetVal.offset - startVal.offset) * t,
				prevOffset: (targetVal.prevOffset - startVal.prevOffset) * t,
				color: interpolateLab(startVal.color, targetVal.color)(t)
			};

			return val;
		}
	});

	s.setPerc = (perc, startOffset) => {

		let color = serie.color;

		if(serie.colors) {
			const thres = serie.colors.find((colInfo, idx) => (perc <= colInfo.till || idx == serie.colors.length - 1));

			if(thres)
				color = thres.color;
		}

		s.set({
			prevOffset: startOffset,
			offset: startOffset + perc,
			color: color
		});
	};

	return s;
};

export function valueStore(initVal, forceContent) {

	let valStore;

	if(!forceContent) {

		const valueStore = tweened(initVal, twOpts);

		valStore = derived(
			valueStore,
			$valueStore => $valueStore.map(s => Math.round(s) + '%').join(' + ')
		);

		valStore.set = v => {
			return valueStore.set(v);
		}
	}
	else {
		valStore = readable(forceContent);
	}

	return valStore;
};