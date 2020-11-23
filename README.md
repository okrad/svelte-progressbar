# svelte-progressbar
A multi-series  SVG progress bar component made with Svelte 3.
It can be rendered both as a linear or radial progressbar. Progression bars and values are fully animated.

If rendered as a linear progressbar there are 2 styles supported:
* Standard: uses svg masks to display inverted text color for the value.
* Thin: the progression bars are rendered as thin bars and the values are placed externally

No dependencies, only 20kb when minified (6.5kb gzipped)!

# Usage

## From npm

```
npm i @okrad/svelte-progressbar
```

### Using in a standard js module

```javascript
import ProgressBar from '@okrad/svelte-progressbar';

const pb = new ProgressBar({
        target: document.getElementById('demo'),
        props: {
                series: 20
        }
});

```

### Using in a Svelte app

```javascript
//main.js
import App from './App.svelte';

const app = new App({
        target: document.body,
        props: {
                series: [20, 42]
        }
});

export default app;
```

```javascript
//App.svelte
<script>
  import ProgressBar from "@okrad/svelte-progressbar";
  export let series = [];
</script>

<ProgressBar {series} />

<button on:click={() => series = [50, 50]}>fill</button>
<button on:click={() => series = [0, 0]}>clear</button>
```

## Building from source

```
npm run build
```

Creates unminified index.js and index.mjs files.

Or...

```
npm run dist
```

Creates minified index.js and index.mjs files.

Either way, include index.js in your html file, then instantiate the component:
```javascript
const pb = new ProgressBar({
        target: document.getElementById('demo'),
        props: {
                series: 20
        }
});
```
This creates a standard progressbar with 20% progression.

```javascript
const pb = new ProgressBar({
        target: document.getElementById('demo'),
        style: 'radial',
        props: {
                series: [20, 10]
        }
});
```
This creates a radial progressbar with 2 series (20% + 10%).

# API
**ProgressBar(options)**: The constructor. Available props are:
* series (number | object | array): for single series progressbars, it can be a number indicating the progression percentage (0-100), or a json object with "perc" and "color" properties. This property is reactive. For example:
```
series: 42
```
```
series: [10, 32]
```
```
series: [
        {
                perc: 10,
                color: '#5AB6DF'
        },
        {
                perc: 32,
                color: '#65CEA7'
        }
]
```


* valueLabel: the label that must be shown as the progress value. It can be a simple text or a markup fragment. If not specified, the progress percentage will be shown.
* style: can be "standard" (default), "thin", "radial" or "semicircle"
* width: determines the width of the whole component
* height: determines the height of the svg viewbox. If not specified, it defaults to the 14% of the viewbox width for standard progressbars, 1% of the viewbox width for thin progressbars, and to the 100% of the viewbox width for radial ones.
* thickness: used only for radial progress bars. It determines the thickness of the bar as a unitless number between 0 and 50 (corresponding to the ray of the circle).
* textSize: the size of the font (in percentage) for the progression value (default: 30 for thin progressbars, 70 for default progressbar, 150 for radial)
* addBackground: determines if a further bar should be added as background to the value bar. Default true.
* bgColor: if addBackground is true, specifies the color of the background bar
* bgFillColor: available only for "radial" and "semicircle" bars. If addBackground is true, specifies the color of the "inner circle" of the progress bar.
* labelColor: specifies the color of the label.
* stackSeries: currently available for "radial" and "semicircle" styles only. If true (default), series will be stacked one after the other. If false, series will be rendered as independent, concentrical arcs.
* margin: currently used only for radial non-stacked bar. Determines the space between the series bars.
* thresholds: list (array) of objects that define which color apply to the progress in relation with the variation of the series value.
* cls: css class to apply to the main element.
* rx, ry: horizontal and vertical border radius (for linear progress bars). If ry is not specified, it defaults to rx.

**updatePerc(perc, seriesId = 0)**: update the specified series progress percentage. Since the "series" property is reactive, if you are using the component in a Svelte app, you can simply bind to it and change its value as needed.

### Component composition ###

Within a svelte app, you can add a subcomponent to a radial progress bar:

```
<ProgressBar style='radial' series={[80]}>
  <MySubcomponent ... />
</ProgressBar>
```

Or you can for example add an HTML fragment by using a foreignObject tag. In this case just make sure to explicitly set the namespace with the xmlns attribute:

```
<ProgressBar style='radial' series={[80]}>
  <foreignObject x="0" y="0" width="100" height="100" xmlns="http://www.w3.org/2000/svg">
    <button on:click={...}>CLICKME</button>
  </foreignObject>
</ProgressBar>
```

# Examples
```
//Linear progress with single series
new ProgressBar({
  target: document.getElementById('pb_container'),
  props: {
    series: [90]
  }
});

//Or...
<ProgressBar series={[90]}/>

//Linear progress with two series
new ProgressBar({
  target: document.getElementById('pb_container'),
  props: {
    series: [40, 25]
  }
});

//Or...
<ProgressBar series={[40, 25]}/>

//Linear progress with "thin" style and two series
new ProgressBar({
  target: document.getElementById('demo3'),
  props: {
    style: 'thin',
    series: [30, 15]
  }
});

//Or...
<ProgressBar style='thin' series={[30, 15]}/>

//Semicircular progress bar
new ProgressBar({
  target: document.getElementById('demo3'),
  props: {
    style: 'semicircle',
    series: [30]
  }
});

//Or...
<ProgressBar style='semicircle' series={[30]}/>

//Radial progress bar with single series and thresholds
new ProgressBar({
  target: document.getElementById('pb_container'),
  props: {
    style: 'radial',
    series: [80],
    thickness: 10,
    thresholds: [
      {
        till: 50,       //Color stays red from 0% to 50%
        color: '#800000'
      },
      {
        till: 100,      //Color goes green from 51% to 100%
        color: '#008000'
      }
    ]
}
});

//Or...
<ProgressBar
  style='radial'
  series={[80]}
  thickness={10}
  thresholds={[
      {
        till: 50,       //Color stays red from 0% to 50%
        color: '#800000'
      },
      {
        till: 100,      //Color goes green from 51% to 100%
        color: '#008000'
      }
    ]}/>
```
Take a look at these [working examples](https://okrad.github.io/svelte-progressbar)!


# Changelog

2020/11/23: Version 1.9.4.
* Small fixes

2020/11/05: Version 1.9.3.
* Typescript fixes

2020/11/02: Version 1.9.2. Removed "legacy" build

2020/10/27: Version 1.9.1. Improved TypeScript support.

2020/10/18: Version 1.9.0.
* Initial TypeScript support!
* Add rx, ry attributes to control linear pb radius
* Add cls parameter for style customization
* Fix to avoid progress overflow
* Fix for Safari positioning bug

2020/09/22: Version 1.8.0. Add component composition handling in radial bars

2020/09/05: Version 1.7.1. Small fixes

2020/08/31: Version 1.7.0
* Major store refactorization, simplified overall code
* Label can be set from outside with the _valueLabel_ prop
* Allow markup (and styling) in label
* Add _bgFillColor_ property
* Add _labelColor_ property

2020/08/26: Version 1.6.2. Bugfixes for radial stacked progress bars

2020/08/12: Version 1.6.1. Semicircular bar fixes

2020/08/10: Version 1.6.0. Added _semicircle_ bar style

2020/08/09: Version 1.5.0. _series_ prop become reactive

2020/03/17: Version 1.4.0. Added thresholds, store refactorization

2020/02/07: Version 1.3.1. Added "addBackground", "bgColor", "stackSeries", "margin" parameters.
Introduced "legacy" mode for compatibility with IE/Edge.

2019/08/07: Added *dist* task

2019/08/06: Refactored thin progressbars

2019/08/02: Added *textSize* parameter

2019/08/01: Handled svg viewport (width/height) while keeping proportions