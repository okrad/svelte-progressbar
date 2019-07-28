# svelte-progressbar
A multi-series  SVG progress bar component made with Svelte 3.
It can be rendered both as a linear or radial progressbar. Progression bars and values are fully animated.

If rendered as a linear progressbar there are 2 styles supported:
* Standard: uses svg masks to display inverted text color for the value.
* Thin: the progression bars are rendered as thin bars and the values are placed externally

# Usage

## From npm

```
npm i @okrad/svelte-progressbar
```

### Using in a standard npm module

```
import ProgressBar from '@okrad/svelte-progressbar';

const pb = new ProgressBar({
        target: document.getElementById('demo'),
        props: {
                series: 20
        }
});

```

### Using in a Svelte app

```
//main.js
import App from './App.svelte';

const app = new App({
        target: document.body,
        props: {
                name: 'world'
        }
});

export default app;
```

```
//App.svelte
<script>
  import ProgressBar from "@okrad/svelte-progressbar";

  export let series = [20, 42];
</script>

<ProgressBar {series} />
```

## Building from source

```
npm run build
```
Creates index.js and index.css files.

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
This creates a radial progressbar with 2 series (20% + 10%).

Take a look at some [working examples](https://okrad.github.io/svelte-progressbar)!

# API
**ProgressBar(options)**: The constructor. Available props are:
* series (number | object | array): for single series progressbars, it can be a number indicating the progression percentage (0-100), or a json object with "perc" and "color" properties.
* style: can be "standard" (default), "thin" or "radial"
* height: for standard and thin progress bars, determines the height of the whole component
* thickness: for thin progress bars, specifies the thickness of the bar as a percentage of the total height of the component. For radial progress bars, determines the thickness of the bar as a unitless number between 0 and 50 (corresponding to the ray of the circle).

**updatePerc(perc, seriesId = 0)**: update the specified series progress percentage
