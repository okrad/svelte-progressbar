# svelte-progressbar
A multi-series  SVG progress bar component made with Svelte 3.
It can be rendered both as a linear or radial progressbar. Progression bars and values are fully animated.

If rendered as a linear progressbar there are 2 styles supported:
* Standard: featuring inverted text color for the values
* Thin: the progression bars are rendered as thin bars and the values are placed externally

# Usage
```
npm run build
```
Creates dist/svelte-progressbar.js and dist/svelte-progressbar.css files.

Include them in your html file, then instantiate the component:
```
const pb = new ProgressBar({
        target: document.getElementById('demo'),
        props: {
                series: 20
        }
});
```
This creates a standard progressbar with 20% progression.

```
const pb = new ProgressBar({
        target: document.getElementById('demo'),
        style: 'radial',
        props: {
                series: [20, 10]
        }
});
```
This creates a radial progressbar with 2 series (20% + 10%)

# API
**ProgressBar(options)**: The constructor. Available props are:
* series (number | object | array): for single series progressbars, it can be a number indicating the progression percentage (0-100), or a json object with "perc" and "color" properties.
* style: can be "standard" (default), "thin" or "radial"

**updatePerc(perc, seriesId = 0)**: update the specified series progress percentage
