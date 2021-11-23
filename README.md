# postcss-replace-values

## Install

```
npm install --save postcss-replace-values
```

## Simple Usage

```js
const postcss = require('postcss');
const replaceValuesPlugin = require('postcss-replace-values');

postcss()
  .use(replaceValuesPlugin({ 
    values: {
      '#000': '#a00'
    }
  }))
```

Input CSS:

```css
body {
  color: #000;
}
```

Output CSS:

```css
body {
  color: #a00;
}
```

## Regex Usage

Only if the `selector` is matching the regex, the value will be replaced.

```js
const postcss = require('postcss');
const replaceValuesPlugin = require('postcss-replace-values');

postcss()
  .use(replaceValuesPlugin({ 
    values: {
      '#000': { value: '#a00', selector: /btn/ }
    }
  }))
```

Input CSS:

```css
body {
  color: #000;
}
.btn {
  color: #000;
}
```

Output CSS:

```css
body {
  color: #000;
}
.btn {
  color: #a00;
}
```

## License

MIT
