export interface SeriesStore {
	subscribe,
	set,
	series ?: Array<Series>,
	updateSeries: (newSeries: Array<Series>) => void,
	updateLabel: (newLabel: string) => void
};

export interface Series {
	perc: number,
	color ?: string,
	prevOffset ?: number,
	radius ?: number
}

export interface Threshold {
	till: number,
	color: string
};