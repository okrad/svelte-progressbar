import { tweened } from 'svelte/motion';
import { cubicOut } from 'svelte/easing';
import { derived, readable } from 'svelte/store';

const twOpts = {
	duration: 1000,
	easing: cubicOut
};

export function serieStore() {
	const s = tweened({
		offset: 0,
		prevOffset: 0,
	}, twOpts);

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