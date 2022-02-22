declare module "@okrad/svelte-progressbar" {

	export default class ProgressBar {

		$$prop_def: {
			series: any,
			style ?: string,
			showProgressValue ?: boolean,
			width ?: number,
			thickness ?: number,
			height ?: number,
			textSize ?: number,
			stackSeries ?: boolean,
			margin ?: number,
			addBackground ?: boolean,
			bgFillColor ?: string,
			bgColor ?: string,
			labelColor ?: string,
			valueLabel ?: string,
			cls ?: string,
			rx ?: number,
			ry ?: number,
			path ?: string,
			colors ?: Array<string>,
			thresholds ?: Array<Threshold>
		}

	}

}

export interface SeriesStore {
	subscribe,
	set,
	series ?: Array<Series>,
	updateSeries: (newSeries: Array<Series>) => void,
	updatePerc: (perc: number, seriesIdx: number) => void,
	updateLabel: (newLabel: string) => void
}

export interface Series {
	perc: number,
	color ?: string,
	prevOffset ?: number,
	radius ?: number
}

export interface Threshold {
	till: number,
	color: string
}