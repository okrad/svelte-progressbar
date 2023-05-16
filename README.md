# svelte-progressbar
A multi-series  SVG progress bar component made with Svelte 3.
It can be rendered as a **linear**, **radial** (circular), **semicircular** or even **custom-shaped** progressbar. Progression bars and values are fully animated.

If rendered as a linear progressbar there are 2 styles supported:
* Standard: uses svg masks to display inverted text color for the value.
* Thin: the progression bars are rendered as thin bars and the values are placed externally

No dependencies, only 35kb when minified (11kb gzipped)!

# Upgrade notice
The current release is a substantial rewrite of much of the library, and as such it's not guaranteed to be compatible!

The following are the main differences with the previous release:

* If no width is specified, the progress bar will take the whole parent width
* The "path" parameter has been removed and replaced by the "pathFn" parameter. See the API paragraph for usage info.

# Usage

```
npm i @okrad/svelte-progressbar
```

Then you can use it like:

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
npm run package
```

Builds svelte files and transpiles ts into dist/ directory

Or...

```
npm run bundle
```

Creates minified index.js and index.mjs files in the bundle/ directory.

You can use the index.js bundle by including it in your html file, then instantiating the component:
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


* valueLabel: the label that must be shown as the progress value. It can be a simple text or a markup fragment. The label can contain "markers" in the  form "%1", "%2"... that will be substituted with the value of the corresponding series (for example: "perc 1: %1, perc 2: %2"). If not specified, the progress percentage will be shown.
* style: can be "standard" (default), "thin", "radial", "semicircle" o "custom"
* width: determines the width of the whole component. If not specified (or set to "auto" or "100%"), the component will occupy the full width of its parent.
* height: determines the height of the component. If not specified, it defaults to 14px for standard progressbars, 1px for thin progressbars.
* thickness: used only for radial progress bars. It determines the thickness of the bar as a unitless number between 0 and 50 (corresponding to the ray of the circle).
* textSize: the size of the font (in percentage) for the progression value (default: 30 for thin progressbars, 70 for default progressbar, 150 for radial)
* addBackground: determines if a further bar should be added as background to the value bar. Default true.
* bgColor: if addBackground is true, specifies the color of the background bar
* bgFillColor: available only for "radial" and "semicircle" bars. If addBackground is true, specifies the color of the "inner circle" of the progress bar.
* labelColor: specifies the color of the label.
* invLabelColor: specifies the "inverted" label color.
* stackSeries: currently available for "radial" and "semicircle" styles only. If true (default), series will be stacked one after the other. If false, series will be rendered as independent, concentrical arcs.
* margin: currently used only for radial non-stacked bar. Determines the space between the series bars.
* thresholds: list (array) of objects that define which color apply to the progress in relation with the variation of the series value.
* cls: css class to apply to the main element.
* rx, ry: horizontal and vertical border radius (for linear progress bars). If ry is not specified, it defaults to rx.
* fillDirection: direction of "filling". Can be one of "l2r" (left to right [default]), "r2l" (right to left), "t2b" (top to bottom) o "b2t" (bottom to top).
* labelAlignX: alignment of the label along the "x" axis. Can be one of "center" (default), "left", "right", "leftOf", "rightOf".
* labelAlignY: alignment of the label along the "y" axis. Can be one of "middle" (default), "top", "bottom", "above", "below".
* pathFn: used only for custom progress bars. It defines a function that must return the svg path that corresponds to the shape of the progress bar. The function receives 2 parameters: the width and the height of the viewbox, to allow scaling the path values to the actual viewbox.

**updateSeries(series)**: update all of the series. Since the "series" property is reactive, if you are using the component in a Svelte app, you can simply bind to it and change its value as needed.

**updatePerc(perc, seriesId = 0)**: update the specified series progress percentage. Again, since the "series" property is reactive, if you are using the component in a Svelte app, you can simply bind to it and change its value as needed.

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
//Linear progress with single series with vanilla js
new ProgressBar({
  target: document.getElementById('pb_container'),
  props: {
    series: [90]
  }
});

//Linear progress as a Svelte component
<ProgressBar series={[90]}/>

//Linear progress with two series with vanilla js
new ProgressBar({
  target: document.getElementById('pb_container'),
  props: {
    series: [40, 25]
  }
});

//Linear progress with two series as a Svelte component
<ProgressBar series={[40, 25]}/>

//Linear progress with "thin" style and two series
new ProgressBar({
  target: document.getElementById('demo3'),
  props: {
    style: 'thin',
    series: [30, 15]
  }
});

//Custom progress bar
<ProgressBar
  style='custom'
  series={[70]}
  path="m 99.999994,28.641477 c 0,26.036253 -23.181375,32.218477 -49.999995,47.14281 C 25.522677,62.948324 0,54.67773 0,28.641477 10e-8,2.6052245 24.031722,-6.9568368 50.598798,6.1131375 78.0152,-7.6240828 99.999994,2.6052245 99.999994,28.641477 Z"/>

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
2023/05/16: Version 2.1.1
* Small fixes

2023/02/21: Version 2.1.0
* Sveltekit conversion

2023/02/21: Version 2.0.0
* Major refactorization, bringing full width support and many other improvements!
* Moved to vite

2021/02/23: Version 1.11.2.
* Fixed exception on component destruct

2021/01/29: Version 1.11.1.
* Fixed issue for inverted label not being visible on Chrome 88
* Fixed a small regression

2021/01/22: Version 1.11.0.
* Introducing CustomShapeProgressBar!
* LinearProgressBar has been refectored to use CustomShapeProgressBar
* Added custom label template
* x & y label positions can be controlled through the labelAlignX and labelAlignY props
* inverted label color can be changed with the invLabelColor prop
* Fill direction can be controlled with the "fillDirection" prop

2021/01/15: Version 1.10.0.
* "color" property is now reactive (and interpolates)
* "updateSeries" function added
* Small fix: Avoid style leaking in the global scope

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