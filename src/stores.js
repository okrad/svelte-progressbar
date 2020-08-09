import { tweened } from 'svelte/motion';
import { cubicOut } from 'svelte/easing';
import { derived, readable} from 'svelte/store';

const twOpts = {
	duration: 1000,
	easing: cubicOut
};

export function stopStore(serie, thresholds) {

	const s = tweened({
		offset: 0,
		prevOffset: 0,
		color: serie.color,
	}, {
		...twOpts,
		interpolate: (startVal, targetVal) => t => {

			let offset, prevOffset;

			if(targetVal.offset > startVal.offset)
				offset = startVal.offset + Math.abs(targetVal.offset - startVal.offset) * t;
			else
				offset = startVal.offset - Math.abs(targetVal.offset - startVal.offset) * t;

			if(targetVal.prevOffset > startVal.prevOffset)
				prevOffset = startVal.prevOffset + Math.abs(targetVal.prevOffset - startVal.prevOffset) * t;
			else
				prevOffset = startVal.prevOffset - Math.abs(targetVal.prevOffset - startVal.prevOffset) * t;

			const val = {
				offset,
				prevOffset,
				color: targetVal.color
			};

			return val;
		}
	});

	s.setPerc = (perc, startOffset) => {

		let color = serie.color;

		if(thresholds && thresholds.length > 0) {
			const thres = thresholds.find((colInfo, idx) => (perc <= colInfo.till || idx == thresholds.length - 1));

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

		let valueStore = tweened(initVal, {
			...twOpts,
			interpolate: (startVal, targetVal) => t => {

				if(startVal.length != targetVal.length)
					startVal = targetVal;

				return startVal.map((v, idx) => {

					let nextVal;

					if(targetVal[idx] > v)
						nextVal = v + (targetVal[idx] - v) * t;
					else
						nextVal = v - (v - targetVal[idx]) * t;

					return nextVal;
				});
			}
		});

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